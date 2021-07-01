/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat3, mat4, vec3 } from 'gl-matrix';
import {
  AddressMode, Buffer, BufferType, CompareFunc, CullMode, FilterMode, GL_UNSIGNED_BYTE, IndexFormat, MinFilterMode, Pipeline, PrimitiveType,
  RenderingDevice, RenderPassContext, SamplerDescriptor, Texture, TexType, UniformFormat, UniformLayoutDescriptor, UniformType,
  UniformValuesDescriptor, VertexBufferLayoutDescriptor, VertexFormat, vertexSize
} from '../device';
import { Accessor, GlTF, MeshPrimitive, Node } from './spec/glTF2';
import { ResolvedGlTF } from './types';
import { getCameraProjection, getExtras, getAccessorVertexFormat, getAccessorData } from './gltf-utils';
import primitiveVert from './shaders/primitive.vert';
import pbrFrag from './shaders/pbr.frag';
import { updateGlTF } from './update';

const I4 = mat4.create();
const Z3 = vec3.create();

const tmpViewProj = mat4.create();

/**
 * Options to render a GlTF model.
 */
export interface RenderGlTFOptions {
  /** Specifies the camera to use. Defaults to the first camera, or an identity camera if model does not contain a camera. */
  camera?: {
    /** The camera index to use. */
    index?: number;

    /** Override the model matrix of the camera. */
    model?: mat4;

    /** Override the projection matrix of the camera. */
    proj?: mat4;
  };

  /** The scene to render. Defaults to the active scene specified by the model. */
  scene?: number;
}

/**
 * Render a resolved GlTF model.
 * @param device the rendering device
 * @param glTF the GlTF model resolved via resolveGlTF function
 * @param options optional rendering options
 */
export function renderGlTF(device: RenderingDevice, glTF: ResolvedGlTF, options: RenderGlTFOptions = {}): void {
  const scene = (options.scene ?? glTF.scene) || 0;
  const nodes = glTF.nodes;
  const rootNodes = glTF.scenes?.[scene]?.nodes;
  if (!nodes || !rootNodes) {
    return; // Nothing to render
  }

  const activeNodes = updateGlTF(glTF, { scene });

  // Get camera matrices
  let view = I4;
  let proj = I4;
  let cameraPosition = Z3;

  if (options.camera) {
    const activeCamera = glTF.cameras?.[options.camera.index || 0];
    if (activeCamera) {
      view = <mat4>activeCamera.extras?.view || I4;
      proj = getCameraProjection(tmpViewProj, activeCamera, device.canvas.width / device.canvas.height);
      cameraPosition = <vec3>activeCamera.extras?.translation || Z3;
    }
    if (options.camera.model) {
      cameraPosition = vec3.fromValues(options.camera.model[12], options.camera.model[13], options.camera.model[14]);
      view = mat4.invert(mat4.create(), options.camera.model);
    }
    proj = options.camera.proj || proj;
  }

  const viewProj = mat4.mul(tmpViewProj, proj, view);

  const env: UniformValuesDescriptor = { cameraPosition, viewProj, };

  // Render all active nodes
  const pass = device.pass();
  const context = device.render(pass);
  for (let i = 0; i < activeNodes.length; ++i) {
    renderGlTFNode(device, context, glTF, nodes[activeNodes[i]], env);
  }
  context.end();
  pass.destroy();
}

function renderGlTFNode(
  device: RenderingDevice, context: RenderPassContext,
  glTF: ResolvedGlTF, node: Node, env: UniformValuesDescriptor
): void {
  const mesh = glTF.meshes?.[node.mesh!];
  if (!mesh) {
    return;
  }

  // Set model matrices. This overrides matrices in the env obj to reduce object allocations
  env.model = mat4.copy(<mat4>env.model || mat4.create(), <mat4>getExtras(node).model || I4);
  env.normalMatrix = mat3.normalFromMat4(<mat3>env.normalMatrix || mat3.create(), <mat4>env.model);

  // Submit draw call for each mesh primitive
  for (let i = 0; i < mesh.primitives.length; ++i) {
    const primitive = mesh.primitives[i];
    let indexed = false;
    let vertexCount = 0;
    let offset = 0;
  
    // Require positions to render
    const positionAccessor = glTF.accessors?.[primitive.attributes.POSITION!];
    if (!positionAccessor) {
      continue;
    } else {
      vertexCount = positionAccessor.count;
    }

    const uniforms: UniformValuesDescriptor = {
      ...env,
      ...loadMaterialUniforms(device, glTF, primitive.material)
    };

    if (primitive.targets) {
      uniforms['targetWeights'] = node.weights || mesh.weights || [0, 0, 0, 0, 0, 0, 0, 0];
    }

    let numJoints = 0;
    const skin = glTF.skins?.[node.skin!];
    if (primitive.attributes['JOINTS_0'] && primitive.attributes['WEIGHTS_0'] && skin) {
      numJoints = skin.joints.length;
      const jointMatrix = getExtras(node).jointMatrix = <Float32Array>getExtras(node).jointMatrix || new Float32Array(numJoints * 16);
      uniforms['jointMatrix'] = jointMatrix;
    }

    // Bind pipeline
    const pipeline = loadGPUPipeline(device, glTF, node.mesh!, i, numJoints);
    context
      .pipeline(pipeline)
      .uniforms(uniforms);

    // Bind vertex buffers
    for (let i = 0; i < pipeline.buffers.length; ++i) {
      const attr = pipeline.buffers[i].attrs[0].name;
      const targetAttrMatch = attr.match(/TARGET_(.+)_(\d+)/);
      const buffer = loadGPUBuffer(
        device, glTF,
        targetAttrMatch ? primitive.targets![<number><unknown>targetAttrMatch[2]][targetAttrMatch[1]] : primitive.attributes[attr],
        BufferType.Vertex
      );
      if (buffer) {
        context.vertex(i, buffer);
      }
    }

    // Bind index buffer
    const indexAccessor = glTF.accessors?.[primitive.indices!];
    if (indexAccessor) {
      const indexBuffer = loadGPUBuffer(device, glTF, primitive.indices, BufferType.Index);
      if (indexBuffer) {
        context.index(indexBuffer);
        vertexCount = indexAccessor.count;
        offset = <number>getExtras(indexAccessor).byteOffset || 0;
        indexed = true;
      }
    }

    // Draw
    if (indexed) {
      context.drawIndexed(vertexCount, 1, offset);
    } else {
      context.draw(vertexCount);
    }
  }
}

function loadGPUPipeline(device: RenderingDevice, glTF: ResolvedGlTF, meshId: number, primitiveId: number, numJoints = 0): Pipeline {
  const primitive = glTF.meshes![meshId].primitives[primitiveId];

  let pipeline: Pipeline | undefined = <Pipeline>getExtras(primitive).pipeline;
  if (pipeline) {
    return pipeline;
  }

  const mode: PrimitiveType = <PrimitiveType> primitive.mode || PrimitiveType.Tri;
  const material = glTF.materials?.[primitive.material!];
  let alphaMode = 'OPAQUE';
  let doubleSided = false;
  if (material) {
    doubleSided = material.doubleSided || false;
    alphaMode = material.alphaMode || alphaMode;
  }

  const buffers = getVertexBufferLayouts(glTF, primitive);

  let indexFormat: IndexFormat = IndexFormat.UInt16;
  const indexAccessor = glTF.accessors?.[primitive.indices!];
  if (indexAccessor && indexAccessor.componentType === IndexFormat.UInt32) {
    indexFormat = IndexFormat.UInt32;
  }

  const normNumJoints = primitive.attributes['JOINTS_0'] && primitive.attributes['WEIGHTS_0'] ?
    Math.ceil(numJoints / 12) * 12 : 0;

  // TODO: better key encoding
  const pipelineKey = JSON.stringify([
    buffers,
    indexFormat,
    normNumJoints,
    mode,
    doubleSided,
    alphaMode
  ]);

  const pipelines: Record<string, Pipeline> = getExtras(glTF).pipelines = <Record<string, Pipeline>>getExtras(glTF).pipelines || {};
  pipeline = pipelines[pipelineKey];
  if (pipeline) {
    return pipeline;
  }

  const defines: string[] = [
    `ALPHAMODE_${alphaMode}`
  ];
  for (const buffer of buffers) {
    for (const attr of buffer.attrs) {
      defines.push(`USE_${attr.name}`);
      if (attr.name === 'COLOR_0' && vertexSize(attr.format) === 3) {
        defines.push('COLOR_0_VEC3');
      }
    }
  }
  if (normNumJoints > 0) {
    defines.push(`NUM_JOINTS ${normNumJoints}`);
  }
  const defineStr = defines.map(define => `#define ${define}`).join('\n');

  const additionalUniforms: UniformLayoutDescriptor = {};
  if (normNumJoints > 0) {
    additionalUniforms['jointMatrix'] = { type: UniformType.Value, format: UniformFormat.Mat4 };
  }
  if (primitive.targets) {
    additionalUniforms['targetWeights'] = { type: UniformType.Value, format: UniformFormat.Float };
  }

  pipeline = getExtras(primitive).pipeline = pipelines[pipelineKey] = device.pipeline({
    vert: defineStr + primitiveVert,
    frag: defineStr + pbrFrag,
    buffers,
    indexFormat,
    mode,
    depth: {
      compare: CompareFunc.LEqual,
      writeEnabled: true
    },
    raster: {
      cullMode: doubleSided ? CullMode.None : CullMode.Back
    },
    uniforms: {
      'model': { type: UniformType.Value, format: UniformFormat.Mat4 },
      'viewProj': { type: UniformType.Value, format: UniformFormat.Mat4 },
      'normalMatrix': { type: UniformType.Value, format: UniformFormat.Mat3 },
      'cameraPosition': { type: UniformType.Value, format: UniformFormat.Vec3 },
      'alphaCutoff': { type: UniformType.Value, format: UniformFormat.Float },
      'baseColorFactor': { type: UniformType.Value, format: UniformFormat.Vec4 },
      'baseColorTexture.tex': { type: UniformType.Tex, format: TexType.Tex2D },
      'baseColorTexture.texCoord': { type: UniformType.Value, format: UniformFormat.Float },
      'metallicFactor': { type: UniformType.Value, format: UniformFormat.Float },
      'roughnessFactor': { type: UniformType.Value, format: UniformFormat.Float },
      'metallicRoughnessTexture.tex': { type: UniformType.Tex, format: TexType.Tex2D },
      'metallicRoughnessTexture.texCoord': { type: UniformType.Value, format: UniformFormat.Float },
      'normalTexture.tex': { type: UniformType.Tex, format: TexType.Tex2D },
      'normalTexture.texCoord': { type: UniformType.Value, format: UniformFormat.Float },
      'normalTexture.scale': { type: UniformType.Value, format: UniformFormat.Float },
      'emissiveFactor': { type: UniformType.Value, format: UniformFormat.Vec3 },
      'emissiveTexture.tex': { type: UniformType.Tex, format: TexType.Tex2D },
      'emissiveTexture.texCoord': { type: UniformType.Value, format: UniformFormat.Float },
      'occlusionTexture.tex': { type: UniformType.Tex, format: TexType.Tex2D },
      'occlusionTexture.texCoord': { type: UniformType.Value, format: UniformFormat.Float },
      'occlusionTexture.scale': { type: UniformType.Value, format: UniformFormat.Float },
      ...additionalUniforms
    }
  });

  return pipeline;
}

function getVertexBufferLayouts(glTF: ResolvedGlTF, primitive: MeshPrimitive): VertexBufferLayoutDescriptor[] {
  const bufferIdMap: Record<string, number> = {};
  const buffers: VertexBufferLayoutDescriptor[] = [];
  let shaderLoc = 0;

  function getBufferLayoutDescriptor(accessor: Accessor): VertexBufferLayoutDescriptor {
    if (!accessor.sparse) {
      const buffer = getAccessorData(glTF, accessor).buffer;
      const bufferKey = `${accessor.bufferView},${buffer.byteOffset},${buffer.byteLength}`;

      if (bufferKey in bufferIdMap) {
        return buffers[bufferIdMap[bufferKey]];
      }

      bufferIdMap[bufferKey] = buffers.length;
    }

    const bufferLayout = {
      attrs: [],
      stride: glTF.bufferViews?.[accessor.bufferView!]?.byteStride
    };
    buffers.push(bufferLayout);

    return bufferLayout;
  }

  // Standard attributes
  for (const name of ['POSITION', 'NORMAL', 'TANGENT', 'TEXCOORD_0', 'TEXCOORD_1', 'COLOR_0', 'JOINTS_0', 'WEIGHTS_0']) {
    const accessor = glTF.accessors?.[primitive.attributes[name]];
    if (accessor) {
      const format = getAccessorVertexFormat(accessor);
      if (!format) {
        // TODO: Support all formats?
        continue;
      }

      getBufferLayoutDescriptor(accessor).attrs.push({ 
        name,
        format,
        shaderLoc,
        offset: <number>getExtras(accessor).byteOffset || 0
      });
      shaderLoc++;
    }
  }

  // Morph target attributes
  if (primitive.targets) {
    const TARGET_ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT'];
    for (let i = 0; i < primitive.targets.length; ++i) {
      for (const name of TARGET_ATTRIBUTES) {
        const accessor = glTF.accessors?.[primitive.targets[i][name]];
        if (accessor) {
          getBufferLayoutDescriptor(accessor).attrs.push({ 
            name: `TARGET_${name}_${i}`,
            format: VertexFormat.Float3,
            shaderLoc,
            offset: <number>getExtras(accessor).byteOffset || 0
          });
          shaderLoc++;
        }
      }
    }
  }

  return buffers;
}

function loadMaterialUniforms(device: RenderingDevice, glTF: ResolvedGlTF, materialId: number | undefined): UniformValuesDescriptor {
  const env: UniformValuesDescriptor = {
    'alphaCutoff': 0,
    'baseColorFactor': [1, 1, 1, 1],
    'baseColorTexture.tex': loadBlankGPUTexture(device, glTF),
    'baseColorTexture.texCoord': -1,
    'metallicFactor': 1,
    'roughnessFactor': 1,
    'metallicRoughnessTexture.tex': loadBlankGPUTexture(device, glTF),
    'metallicRoughnessTexture.texCoord': -1,
    'normalTexture.tex': loadBlankGPUTexture(device, glTF),
    'normalTexture.texCoord': -1,
    'normalTexture.scale': 1,
    'emissiveFactor': [0, 0, 0],
    'emissiveTexture.tex': loadBlankGPUTexture(device, glTF),
    'emissiveTexture.texCoord': -1,
    'occlusionTexture.tex': loadBlankGPUTexture(device, glTF),
    'occlusionTexture.texCoord': -1,
    'occlusionTexture.scale': 0
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setTexture(obj: any, name: string, scaleField: string | null = null): void {
    if (obj[name]) {
      env[`${name}.tex`] = loadGPUTexture(device, glTF, obj[name].index);
      env[`${name}.texCoord`] = obj[name].texCoord || 0;
      if (scaleField) {
        env[`${name}.scale`] = obj[name][scaleField] || env[`${name}.scale`];
      }
    }
  }

  const material = glTF.materials?.[materialId!];
  if (material) {
    if (material.pbrMetallicRoughness) {
      const pbr = material.pbrMetallicRoughness;

      env.baseColorFactor = pbr.baseColorFactor || env.baseColorFactor;
      if (pbr.metallicFactor || pbr.metallicFactor === 0) {
        env.metallicFactor = pbr.metallicFactor;
      }

      if (pbr.roughnessFactor || pbr.roughnessFactor === 0) {
        env.roughnessFactor = pbr.roughnessFactor;
      }
      setTexture(pbr, 'baseColorTexture');
      setTexture(pbr, 'metallicRoughnessTexture');
    }

    env.alphaCutoff = material.alphaCutoff || 0;
    env.emissiveFactor = material.emissiveFactor || env.emissiveFactor;

    setTexture(material, 'emissiveTexture');
    setTexture(material, 'occlusionTexture', 'strength');
    setTexture(material, 'normalTexture', 'scale');
  }

  return env;
}

function loadGPUBuffer(device: RenderingDevice, glTF: ResolvedGlTF, accessorId: number | undefined, targetHint: BufferType): Buffer | null {
  const accessor = glTF.accessors?.[accessorId!];
  if (!accessor) {
    return null;
  }

  // sparse accessor uses its own buffer
  // ubyte index is not supported in mugl, thus also uses its own widened buffer
  const isUByteIndex = targetHint === BufferType.Index && accessor.componentType === GL_UNSIGNED_BYTE;
  if (accessor.sparse || isUByteIndex) {
    let gpuBuffer: Buffer | null = <Buffer>getExtras(accessor).gpuBuffer;
    if (!gpuBuffer) {
      const accessorData = getAccessorData(glTF, accessor);
      let data: ArrayBufferView = accessorData.buffer;
      if (isUByteIndex) {
        const widenedData = new Uint16Array(data.byteLength);
        for (let i = 0; i < data.byteLength; ++i) {
          widenedData[i] = (<Uint8Array>data)[accessorData.byteOffset + i];
        }
        data = getExtras(accessor).buffer = new Uint8Array(widenedData.buffer, 0, widenedData.byteLength);
        getExtras(accessor).byteOffset = 0;
      }

      gpuBuffer = getExtras(accessor).gpuBuffer =
        device.buffer({ type: targetHint, size: data.byteLength }).data(data);
    }
    return gpuBuffer;
  }

  // Other accessors must have buffer view
  const bufferView = glTF.bufferViews?.[accessor.bufferView!];
  if (!bufferView) {
    return null;
  }

  // Vertex buffers are splitted to optimize for pipeline sharing, but we want to share them if possible
  const gpuBuffers: Record<string, Buffer> = getExtras(bufferView).gpuBuffers =
    <Record<string, Buffer>>getExtras(bufferView).gpuBuffers || {};

  const buffer = getAccessorData(glTF, accessor).buffer;
  const bufferKey = `${buffer.byteOffset},${buffer.byteLength}`;

  if (gpuBuffers[bufferKey]) {
    return gpuBuffers[bufferKey];
  }

  return gpuBuffers[bufferKey] =
      device.buffer({ type: <BufferType>bufferView.target || targetHint, size: buffer.byteLength }).data(buffer);
}

function loadGPUTexture(device: RenderingDevice, glTF: ResolvedGlTF, textureId: number): Texture {
  const texture = glTF.textures?.[textureId];
  if (!texture) {
    return loadBlankGPUTexture(device, glTF);
  }

  let gpuTexture: Texture | undefined = <Texture>getExtras(texture).texture;
  if (gpuTexture) {
    return gpuTexture;
  }

  let img: HTMLImageElement | null = null;
  const samplerDesc: SamplerDescriptor = {
    wrapU: AddressMode.Repeat,
    wrapV: AddressMode.Repeat,
    magFilter: FilterMode.Linear,
    minFilter: FilterMode.Linear,
  };

  const image = glTF.images?.[texture.source!];
  if (image) {
    img = image.extras.image;
  }

  const sampler = glTF.samplers?.[texture.sampler!];
  if (sampler) {
    if (sampler.magFilter) {
      samplerDesc.magFilter = <FilterMode>sampler.magFilter;
    }

    // TODO: Support mipmapping
    if (sampler.minFilter) {
      switch (sampler.minFilter) {
        case MinFilterMode.Nearest:
        case MinFilterMode.NearestMipmapNearest:
        case MinFilterMode.NearestMipmapLinear:
          samplerDesc.minFilter = MinFilterMode.Nearest;
          break;
        default:
          samplerDesc.minFilter = MinFilterMode.Linear;
          break;
      }
    }
    if (sampler.wrapS) {
      samplerDesc.wrapU = <AddressMode>sampler.wrapS;
    }
    if (sampler.wrapT) {
      samplerDesc.wrapV = <AddressMode>sampler.wrapT;
    }
  }

  // TODO: resize non power of 2 textures

  gpuTexture = getExtras(texture).texture = device.texture({
    size: img ? [img.naturalWidth, img.naturalHeight] : [1, 1]
  }, samplerDesc);
  gpuTexture.data(img ? img : new Uint8Array([255, 255, 255, 255]));

  return gpuTexture;
}

/** Load a placeholder texture. */
function loadBlankGPUTexture(device: RenderingDevice, glTF: GlTF): Texture {
  let gpuTexture: Texture | undefined = <Texture>getExtras(glTF).blankTexture;
  if (gpuTexture) {
    return gpuTexture;
  }

  gpuTexture = getExtras(glTF).blankTexture =
    device.texture({ size: [1, 1] }).data(new Uint8Array([255, 255, 255, 255]));

  return gpuTexture;
}
