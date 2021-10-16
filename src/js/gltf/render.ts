/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Mat3, mat3, Mat4, mat4, Vec3, vec3 } from 'munum';
import { GLenum } from '../../common/gl';
import { PRIMITIVE_VS_SRC } from '../../common/shaders/gltf/primitive.vs.glsl';
import { PBR_FS_SRC } from '../../common/shaders/gltf/pbr.fs.glsl';
import {
  AddressMode, BlendFactor, Buffer, BufferType, CompareFunc, CullMode, FilterMode, IndexFormat, MinFilterMode, Pipeline, PrimitiveType,
  RenderingDevice, RenderPassContext, SamplerDescriptor, Texture, TexType, UniformFormat, UniformLayout, UniformType,
  UniformBindings, VertexBufferLayout, VertexFormat, vertexSize, ShaderType
} from '../device';
import { Accessor, GlTF, Mesh, MeshPrimitive, Node } from '../gltf-spec/glTF2';
import { ResolvedGlTF } from './types';
import { getCameraProjection, getExtras, getAccessorVertexFormat, getAccessorData } from './gltf-utils';
import { updateGlTF } from './update';

// Only supports 16 attributes
const MAX_VERTEX_ATTRIBS = 16;
const TARGET_ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT'];
const TARGET_ATTRIBUTE_MATCHER = /(POSITION|NORMAL|TANGENT)_(\d+)/;

const I4 = mat4.create();
const Z3 = vec3.create();

const tmpViewProj = mat4.create();

interface UniformValuesDescriptor {
  [key: string]: number | number[] | Float32Array | Texture
}

/**
 * Options to render a GlTF model.
 */
export interface RenderGlTFOptions {
  /** Specifies the camera to use. Defaults to the first camera, or an identity camera if model does not contain a camera. */
  camera?: {
    /** The camera index to use. */
    index?: number;

    /** Override the model matrix of the camera. */
    model?: Mat4;

    /** Override the projection matrix of the camera. */
    proj?: Mat4;
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
      view = (activeCamera.extras?.view as Mat4) || I4;
      proj = getCameraProjection(tmpViewProj, activeCamera, device.width / device.height);
      cameraPosition = (activeCamera.extras?.translation as Vec3) || Z3;
    }
    if (options.camera.model) {
      cameraPosition = vec3.create(options.camera.model[12], options.camera.model[13], options.camera.model[14]);
      mat4.invert(options.camera.model, view);
    }
    proj = options.camera.proj || proj;
  }

  const viewProj = mat4.mul(proj, view, tmpViewProj);

  const env: UniformValuesDescriptor = { cameraPosition, viewProj, };

  // Render all active nodes
  const pass = device.pass();
  const context = device.render(pass);

  const transparentDrawables: { node: Node, mesh: Mesh, primitive: MeshPrimitive }[] = [];

  // Draw opaque primitives
  for (let i = 0; i < activeNodes.length; ++i) {
    const node = nodes[activeNodes[i]];
    const mesh = glTF.meshes?.[node.mesh!];
    if (mesh) {
      for (let i = 0; i < mesh.primitives.length; ++i) {
        const primitive = mesh.primitives[i];
        if (glTF.materials?.[primitive.material!]?.alphaMode === 'BLEND') {
          transparentDrawables.push({ node, mesh, primitive });
        } else {
          renderGlTFPrimitive(device, context, glTF, node, mesh, primitive, env);
        }
      }
    }
  }

  // Draw transparent primitives last
  // TODO: depth sorting, so that the furthest nodes are rendered first
  for (const drawable of transparentDrawables) {
    renderGlTFPrimitive(device, context, glTF, drawable.node, drawable.mesh, drawable.primitive, env);
  }

  context.end();
  pass.destroy();
}

function renderGlTFPrimitive(
  device: RenderingDevice, context: RenderPassContext, glTF: ResolvedGlTF,
  node: Node, mesh: Mesh, primitive: MeshPrimitive,
  env: UniformValuesDescriptor
): void {
  // Set model matrices. This overrides matrices in the env obj to reduce object allocations
  env.model = mat4.copy((getExtras(node).model as Mat4) || I4, (env.model as Mat4) || mat4.create());
  if (!mat4.nmat3(env.model as Mat4, (env.normalMatrix = (env.normalMatrix as Mat3) || mat3.create()))) {
    mat3.id(env.normalMatrix as Mat3);
  }

  let indexed = false;
  let offset = 0;
  let vertexCount = glTF.accessors?.[primitive.attributes.POSITION!]?.count || 0;

  // Require positions to render
  if (!vertexCount) {
    return;
  }

  const uniforms: UniformValuesDescriptor = {
    ...env,
    ...loadMaterialUniforms(device, glTF, primitive.material)
  };

  if (primitive.targets) {
    uniforms['targetWeights'] = (getExtras(node).weights as number[]) || node.weights || mesh.weights || [0, 0, 0, 0, 0, 0, 0, 0];
  }

  let numJoints = 0;
  const skin = glTF.skins?.[node.skin!];
  if (primitive.attributes.JOINTS_0 && primitive.attributes.WEIGHTS_0 && skin) {
    numJoints = skin.joints.length;
    const jointMatrix = getExtras(node).jointMatrix = (getExtras(node).jointMatrix as Float32Array) || new Float32Array(numJoints * 16);
    uniforms['jointMatrix'] = jointMatrix;
  }

  const bindings: UniformBindings = [];
  for (const name in uniforms) {
    if (typeof uniforms[name] ==='number') {
      bindings.push({ name, value: uniforms[name] as number });
    } else if ((uniforms[name] as number[]).length) {
      bindings.push({ name, values: uniforms[name] as number[] });
    } else {
      bindings.push({ name, tex: uniforms[name] as Texture });
    }
  }

  // Bind pipeline
  const pipeline = loadGPUPipeline(device, glTF, primitive, numJoints);
  context
    .pipeline(pipeline)
    .uniforms(bindings);

  // Bind vertex buffers
  for (let i = 0; i < pipeline.props.buffers.length; ++i) {
    const attr = pipeline.props.buffers[i].attrs[0].name;
    const targetAttrMatch = TARGET_ATTRIBUTE_MATCHER.exec(attr);
    const buffer = loadGPUBuffer(
      device, glTF,
      targetAttrMatch ? primitive.targets![targetAttrMatch[2] as unknown as number][targetAttrMatch[1]] : primitive.attributes[attr],
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
      offset = (getExtras(indexAccessor).byteOffset as number) || 0;
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

function loadGPUPipeline(device: RenderingDevice, glTF: ResolvedGlTF, primitive: MeshPrimitive, numJoints = 0): Pipeline {
  let pipeline: Pipeline | undefined = getExtras(primitive).pipeline as Pipeline | undefined;
  if (pipeline) {
    return pipeline;
  }

  const mode: PrimitiveType = (primitive.mode as PrimitiveType) || PrimitiveType.Tri;
  const material = glTF.materials?.[primitive.material!];
  let alphaMode = 'OPAQUE';
  let doubleSided = false;
  let unlit = false;
  if (material) {
    doubleSided = material.doubleSided || false;
    alphaMode = material.alphaMode || alphaMode;
    unlit = !!material.extensions?.['KHR_materials_unlit'];
  }

  const buffers = getVertexBufferLayouts(glTF, primitive);

  const indexFormat = (glTF.accessors?.[primitive.indices!]?.componentType === IndexFormat.UInt32) ?
    IndexFormat.UInt32 : IndexFormat.UInt16;

  const normNumJoints = primitive.attributes['JOINTS_0'] && primitive.attributes['WEIGHTS_0'] ?
    Math.ceil(numJoints / 12) * 12 : 0;

  // TODO: better key encoding
  const pipelineKey = JSON.stringify([
    buffers,
    doubleSided,
    alphaMode,
    normNumJoints,
    indexFormat,
    mode,
    unlit
  ]);

  const pipelines: Record<string, Pipeline> = getExtras(glTF).pipelines =
    (getExtras(glTF).pipelines as Record<string, Pipeline>) || {};
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
  if (unlit) {
    defines.push('MATERIAL_UNLIT');
  }
  const defineStr = defines.map(define => `#define ${define}\n`).join('');

  const additionalUniforms: UniformLayout = [];
  if (normNumJoints > 0) {
    additionalUniforms.push({ name: 'jointMatrix', type: UniformType.Value, valueFormat: UniformFormat.Mat4 });
  }
  if (primitive.targets) {
    additionalUniforms.push({ name: 'targetWeights', type: UniformType.Value, valueFormat: UniformFormat.Float });
  }

  const vert = device.shader({ type: ShaderType.Vertex, source: defineStr + PRIMITIVE_VS_SRC });
  const frag = device.shader({ type: ShaderType.Fragment, source: defineStr + PBR_FS_SRC });

  pipeline = getExtras(primitive).pipeline = pipelines[pipelineKey] = device.pipeline({
    vert,
    frag,
    buffers,
    indexFormat,
    mode,
    depth: {
      compare: CompareFunc.LEqual,
      write: !(alphaMode === 'BLEND')
    },
    blend: (alphaMode === 'BLEND') ? {
      srcFactorRGB: BlendFactor.SrcAlpha,
      dstFactorRGB: BlendFactor.OneMinusSrcAlpha,
      srcFactorAlpha: BlendFactor.One,
      dstFactorAlpha: BlendFactor.OneMinusSrcAlpha,
    }: undefined,
    raster: {
      cullMode: doubleSided ? CullMode.None : CullMode.Back
    },
    uniforms: [
      { name: 'model', type: UniformType.Value, valueFormat: UniformFormat.Mat4 },
      { name: 'viewProj', type: UniformType.Value, valueFormat: UniformFormat.Mat4 },
      { name: 'normalMatrix', type: UniformType.Value, valueFormat: UniformFormat.Mat3 },
      { name: 'cameraPosition', type: UniformType.Value, valueFormat: UniformFormat.Vec3 },
      { name: 'alphaCutoff', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'baseColorFactor', type: UniformType.Value, valueFormat: UniformFormat.Vec4 },
      { name: 'baseColorTexture.tex', type: UniformType.Tex, texType: TexType.Tex2D },
      { name: 'baseColorTexture.texCoord', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'metallicFactor', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'roughnessFactor', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'metallicRoughnessTexture.tex', type: UniformType.Tex, texType: TexType.Tex2D },
      { name: 'metallicRoughnessTexture.texCoord', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'normalTexture.tex', type: UniformType.Tex, texType: TexType.Tex2D },
      { name: 'normalTexture.texCoord', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'normalTexture.scale', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'emissiveFactor', type: UniformType.Value, valueFormat: UniformFormat.Vec3 },
      { name: 'emissiveTexture.tex', type: UniformType.Tex, texType: TexType.Tex2D },
      { name: 'emissiveTexture.texCoord', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'occlusionTexture.tex', type: UniformType.Tex, texType: TexType.Tex2D },
      { name: 'occlusionTexture.texCoord', type: UniformType.Value, valueFormat: UniformFormat.Float },
      { name: 'occlusionTexture.scale', type: UniformType.Value, valueFormat: UniformFormat.Float },
      ...additionalUniforms
    ]
  });

  vert.destroy();
  frag.destroy();

  return pipeline;
}

function getVertexBufferLayouts(glTF: ResolvedGlTF, primitive: MeshPrimitive): VertexBufferLayout[] {
  const bufferIdMap: Record<string, number> = {};
  const buffers: VertexBufferLayout[] = [];
  let shaderLoc = 0;

  function getBufferLayoutDescriptor(accessor: Accessor): VertexBufferLayout {
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
        offset: (getExtras(accessor).byteOffset as number) || 0
      });
      shaderLoc++;
    }
  }

  // Morph target attributes
  if (primitive.targets) {
    const accessors: (Accessor|undefined)[] = new Array(3);
    for (let i = 0; i < primitive.targets.length; ++i) {
      let attrs = 0;

      for (let j = 0; j < TARGET_ATTRIBUTES.length; ++j) {
        if ((accessors[j] = glTF.accessors?.[primitive.targets[i][TARGET_ATTRIBUTES[j]]])) {
          ++attrs;
        }
      }

      if (shaderLoc + attrs > MAX_VERTEX_ATTRIBS) { // Too many attributes
        break;
      }

      for (let j = 0; j < TARGET_ATTRIBUTES.length; ++j) {
        const accessor = accessors[j];
        if (accessor) {
          getBufferLayoutDescriptor(accessor).attrs.push({ 
            name: `${TARGET_ATTRIBUTES[j]}_${i}`,
            format: VertexFormat.Float3,
            shaderLoc,
            offset: (getExtras(accessor).byteOffset as number) || 0
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
    'alphaCutoff': 0.5,
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
        env[`${name}.scale`] = obj[name][scaleField] ?? env[`${name}.scale`];
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

    env.alphaCutoff = material.alphaCutoff ?? env.alphaCutoff;
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
  // ubyte index is not supported in mugl, thus uses its own widened buffer
  const isUByteIndex = targetHint === BufferType.Index && accessor.componentType === GLenum.UNSIGNED_BYTE;
  if (accessor.sparse || isUByteIndex) {
    let gpuBuffer: Buffer | undefined = getExtras(accessor).gpuBuffer as Buffer | undefined;
    if (!gpuBuffer) {
      const accessorData = getAccessorData(glTF, accessor);
      let data: ArrayBufferView = accessorData.buffer;
      if (isUByteIndex) {
        const widenedData = new Uint16Array(data.byteLength);
        for (let i = 0; i < data.byteLength; ++i) {
          widenedData[i] = (data as Uint8Array)[accessorData.byteOffset + i];
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
    (getExtras(bufferView).gpuBuffers as Record<string, Buffer>) || {};

  const buffer = getAccessorData(glTF, accessor).buffer;
  const bufferKey = `${buffer.byteOffset},${buffer.byteLength}`;

  if (gpuBuffers[bufferKey]) {
    return gpuBuffers[bufferKey];
  }

  return gpuBuffers[bufferKey] =
      device.buffer({ type: (bufferView.target as BufferType) || targetHint, size: buffer.byteLength }).data(buffer);
}

function loadGPUTexture(device: RenderingDevice, glTF: ResolvedGlTF, textureId: number): Texture {
  const texture = glTF.textures?.[textureId];
  if (!texture) {
    return loadBlankGPUTexture(device, glTF);
  }

  let gpuTexture: Texture | undefined = getExtras(texture).texture as Texture | undefined;
  if (gpuTexture) {
    return gpuTexture;
  }

  let img: HTMLImageElement | null = null;
  const samplerDesc: SamplerDescriptor = {
    wrapU: AddressMode.Repeat,
    wrapV: AddressMode.Repeat,
    magFilter: FilterMode.Linear,
    minFilter: MinFilterMode.Linear,
  };

  const image = glTF.images?.[texture.source!];
  if (image) {
    img = image.extras.image;
  }

  const sampler = glTF.samplers?.[texture.sampler!];
  if (sampler) {
    samplerDesc.wrapU = sampler.wrapS as AddressMode || samplerDesc.wrapU;
    samplerDesc.wrapV = sampler.wrapT as AddressMode || samplerDesc.wrapV;
    samplerDesc.magFilter = sampler.magFilter as FilterMode || samplerDesc.magFilter;

    // TODO: Support mipmapping
    switch (sampler.minFilter) {
      case MinFilterMode.Nearest:
      case MinFilterMode.NearestMipmapNearest:
      case MinFilterMode.NearestMipmapLinear:
        samplerDesc.minFilter = MinFilterMode.Nearest;
        break;
    }
  }

  // TODO: resize non power of 2 textures

  gpuTexture = getExtras(texture).texture = device.texture({
    width: img?.naturalWidth || 1,
    height: img?.naturalHeight || 1,
  }, samplerDesc);
  gpuTexture.data(img ? { image: img } : { buffer: new Uint8Array([255, 255, 255, 255]) });

  return gpuTexture;
}

/** Load a placeholder texture. */
function loadBlankGPUTexture(device: RenderingDevice, glTF: GlTF): Texture {
  let gpuTexture: Texture | undefined = getExtras(glTF).blankTexture as Texture | undefined;
  if (gpuTexture) {
    return gpuTexture;
  }

  gpuTexture = getExtras(glTF).blankTexture =
    device.texture({}).data({ buffer: new Uint8Array([255, 255, 255, 255]) });

  return gpuTexture;
}
