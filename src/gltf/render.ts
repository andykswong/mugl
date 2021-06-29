/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat3, mat4, vec3 } from 'gl-matrix';
import {
  AddressMode, Buffer, BufferType, CompareFunc, CullMode, FilterMode, IndexFormat, indexSize, MinFilterMode, Pipeline, PrimitiveType,
  RenderingDevice, RenderPassContext, SamplerDescriptor, Texture, TexType, UniformFormat, UniformLayoutDescriptor, UniformType,
  UniformValuesDescriptor, VertexBufferLayoutDescriptor, VertexFormat
} from '../device';

import { GL_FLOAT, GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT } from '../device';
import { GlTF, MeshPrimitive, Node } from './spec/glTF2';
import { ResolvedGlTF } from './types';
import { getCameraProjection, getExtras, updateGlTFNodes } from './gltf-utils';
import primitiveVert from './shaders/primitive.vert';
import pbrFrag from './shaders/pbr.frag';

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
  const nodes = glTF.nodes;
  const rootNodes = glTF.scenes?.[(options.scene ?? glTF.scene) || 0]?.nodes;
  if (!nodes || !rootNodes) {
    return; // Nothing to render
  }

  const activeNodes = updateGlTFNodes(glTF);

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

  const env: UniformValuesDescriptor = {
    cameraPosition,
    viewProj,
  };

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
  glTF: GlTF, node: Node, env: UniformValuesDescriptor
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

    // Bind pipeline
    const pipeline = loadGPUPipeline(device, glTF, node.mesh!, i);
    context
      .pipeline(pipeline)
      .uniforms({
        ...env,
        ...loadMaterialUniforms(device, glTF, primitive.material)
      });

    // Bind vertex buffers
    for (let i = 0; i < pipeline.buffers.length; ++i) {
      const attr = pipeline.buffers[i].attrs[0].name;
      const buffer = loadGPUBuffer(device, glTF, primitive.attributes[attr], BufferType.Vertex);
      if (buffer) {
        context.vertex(i, buffer);
      }
    }

    // Bind index buffer
    {
      const accessor = glTF.accessors?.[primitive.indices!];
      if (accessor) {
        const indexBuffer = loadGPUBuffer(device, glTF, primitive.indices, BufferType.Index);
        if (indexBuffer) {
          context.index(indexBuffer);
          vertexCount = accessor.count;
          offset = (accessor.byteOffset || 0) / indexSize(pipeline.indexFormat);
          indexed = true;
        }
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

function loadGPUPipeline(device: RenderingDevice, glTF: GlTF, meshId: number, primitiveId: number): Pipeline {
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

  // TODO: better key encoding
  const pipelineKey = JSON.stringify({
    buffers,
    indexFormat,
    mode,
    doubleSided,
    alphaMode
  });

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
    }
  }
  const defineStr = defines.map(define => `#define ${define}`).join('\n');

  // TODO: set skin / morph uniforms
  const additionalUniforms: UniformLayoutDescriptor = {

  };

  // TODO: Cache unique pipeline combinations
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

function getVertexBufferLayouts(glTF: GlTF, primitive: MeshPrimitive): VertexBufferLayoutDescriptor[] {
  const buffers: VertexBufferLayoutDescriptor[] = [];

  function pushAccessor(name: string, shaderLoc: number, bufferViewId: number, format: VertexFormat, stride: number | undefined, offset = 0) {
    const alignment = stride || 4;
    const alignedOffset = (offset || 0) % alignment;
    // TODO: combine interleaved buffers
    buffers.push({ attrs: [{ name, format, offset: alignedOffset, shaderLoc }], stride });
  }

  let shaderLoc = 0;
  const ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT', 'TEXCOORD_0', 'TEXCOORD_1', 'COLOR_0', 'JOINTS_0', 'WEIGHTS_0'];
  for (const name of ATTRIBUTES) {
    const accessor = glTF.accessors?.[primitive.attributes[name]];
    if (!accessor) {
      continue;
    }
    // TODO: handle accessor sparse storage
    const bufferView = glTF.bufferViews?.[accessor.bufferView!];
    if (!bufferView) {
      continue;
    }

    const format = getVertexFormat(accessor.type, accessor.componentType, accessor.normalized);
    if (!format) {
      // TODO: Support all formats?
      continue;
    }

    pushAccessor(name, shaderLoc++, accessor.bufferView!, format, bufferView.byteStride, accessor.byteOffset);
  }

  if (primitive.targets) {
    const TARGET_ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT'];
    for (let i = 0; i < primitive.targets.length; ++i) {
      for (const name of TARGET_ATTRIBUTES) {
        const accessor = glTF.accessors?.[primitive.targets[i][name]];
        if (!accessor) {
          continue;
        }
        // TODO: handle accessor sparse storage
        const bufferView = glTF.bufferViews?.[accessor.bufferView!];
        if (!bufferView) {
          continue;
        }
        pushAccessor(`TARGET_${name}_${i}`, shaderLoc++, accessor.bufferView!, VertexFormat.Float3, bufferView.byteStride, accessor.byteOffset);
      }
    }
  }

  return buffers;
}

function loadMaterialUniforms(device: RenderingDevice, glTF: GlTF, materialId: number | undefined): UniformValuesDescriptor {
  const env = {
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

  const material = glTF.materials?.[materialId!];
  if (material) {
    if (material.alphaCutoff) {
      env.alphaCutoff = material.alphaCutoff;
    }

    if (material.pbrMetallicRoughness) {
      const pbr = material.pbrMetallicRoughness;

      if (pbr.baseColorFactor) {
        env.baseColorFactor = pbr.baseColorFactor;
      }

      if (pbr.baseColorTexture) {
        env['baseColorTexture.tex'] = loadGPUTexture(device, glTF, pbr.baseColorTexture.index);
        env['baseColorTexture.texCoord'] = pbr.baseColorTexture.texCoord || 0;
      }

      if (pbr.metallicFactor || pbr.metallicFactor === 0) {
        env.metallicFactor = pbr.metallicFactor;
      }

      if (pbr.roughnessFactor || pbr.roughnessFactor === 0) {
        env.roughnessFactor = pbr.roughnessFactor;
      }

      if (pbr.metallicRoughnessTexture) {
        env['metallicRoughnessTexture.tex'] = loadGPUTexture(device, glTF, pbr.metallicRoughnessTexture.index);
        env['metallicRoughnessTexture.texCoord'] = pbr.metallicRoughnessTexture.texCoord || 0;
      }
    }

    if (material.normalTexture) {
      env['normalTexture.tex'] = loadGPUTexture(device, glTF, material.normalTexture.index);
      env['normalTexture.texCoord'] = material.normalTexture.texCoord || 0;
      env['normalTexture.scale'] = material.normalTexture.scale || 1;
    }

    if (material.emissiveFactor) {
      env.emissiveFactor = material.emissiveFactor;
    }

    if (material.emissiveTexture) {
      env['emissiveTexture.tex'] = loadGPUTexture(device, glTF, material.emissiveTexture.index);
      env['emissiveTexture.texCoord'] = material.emissiveTexture.texCoord || 0;
    }
    
    if (material.occlusionTexture) {
      env['occlusionTexture.tex'] = loadGPUTexture(device, glTF, material.occlusionTexture.index);
      env['occlusionTexture.texCoord'] = material.occlusionTexture.texCoord || 0;
      env['occlusionTexture.scale'] = material.occlusionTexture.strength || 1;
    }
  }

  return env;
}

function loadGPUBuffer(device: RenderingDevice, glTF: GlTF, accessorId: number | undefined, targetHint: BufferType): Buffer | null {
  const accessor = glTF.accessors?.[accessorId!];
  if (!accessor) {
    return null;
  }

  // TODO: handle accessor sparse storage
  const bufferView = glTF.bufferViews?.[accessor.bufferView!];
  if (!bufferView) {
    return null;
  }

  const data = <Uint8Array>getExtras(bufferView).bufferView;

  // Index buffer can be easily shared
  if (targetHint === BufferType.Index) {
    let gpuBuffer: Buffer | null = <Buffer>getExtras(bufferView).gpuBuffer;
    if (gpuBuffer) {
      return gpuBuffer;
    }

    gpuBuffer = getExtras(bufferView).gpuBuffer =
      device.buffer({ type: <BufferType>bufferView.target || targetHint, size: bufferView.byteLength }).data(data);
    return gpuBuffer;
  }

  // Vertex buffers need to be splitted to optimize for pipeline sharing
  const gpuBuffers: Record<string, Buffer> = getExtras(bufferView).gpuBuffers = <Record<string, Buffer>>getExtras(bufferView).gpuBuffers || {};
  const alignment = bufferView.byteStride || 4;
  const alignedAttrOffset = (accessor.byteOffset || 0) % alignment;
  const bufferOffset = (accessor.byteOffset || 0) - alignedAttrOffset;
  const bufferLength = accessor.count * getVertexByteSize(accessor.type, accessor.componentType);
  const bufferKey = `${bufferOffset},${bufferLength}`;

  if (gpuBuffers[bufferKey]) {
    return gpuBuffers[bufferKey];
  }

  const alignedBufferView = new Uint8Array(data.buffer, (data.byteOffset || 0) + bufferOffset, bufferLength);
  const gpuBuffer = gpuBuffers[bufferKey] =
      device.buffer({ type: <BufferType>bufferView.target || targetHint, size: bufferLength }).data(alignedBufferView);
  return gpuBuffer;
}

function loadGPUTexture(device: RenderingDevice, glTF: GlTF, textureId: number): Texture {
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
    img = <HTMLImageElement>getExtras(image).image;
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
  gpuTexture.data(img ? img : new Uint8Array([1, 1, 1, 1]));

  return gpuTexture;
}

function loadBlankGPUTexture(device: RenderingDevice, glTF: GlTF): Texture {
  let gpuTexture: Texture | undefined = <Texture>getExtras(glTF).blankTexture;
  if (gpuTexture) {
    return gpuTexture;
  }

  gpuTexture = getExtras(glTF).blankTexture =
    device.texture({ size: [1, 1] }).data(new Uint8Array([1, 1, 1, 1]));

  return gpuTexture;
}

function getVertexFormat(accessorType: string, componentType: number, normalized = false): VertexFormat | null {
  switch (accessorType) {
    case 'VEC2':
      if (componentType === GL_FLOAT) {
        return VertexFormat.Float2;
      } else if (componentType === GL_UNSIGNED_SHORT) {
        return normalized ? VertexFormat.UShort2N : VertexFormat.UShort2;
      }
      // TODO: Unsupported UNSIGNED_BYTE 2/2
      break;
    case 'VEC3':
      if (componentType === GL_FLOAT) {
        return VertexFormat.Float3;
      }
      // TODO: Unsupported UChar/UShort 3
      break;
    case 'VEC4':
      if (componentType === GL_FLOAT) {
        return VertexFormat.Float4;
      } else if (componentType === GL_UNSIGNED_BYTE) {
        return normalized ? VertexFormat.UChar4N : VertexFormat.UChar4;
      } else if (componentType === GL_UNSIGNED_SHORT) {
        return normalized ? VertexFormat.UShort4N : VertexFormat.UShort4;
      }
      break;
  }
  return null;
}

function getVertexByteSize(accessorType: string, componentType: number): number {
  const length = (accessorType === 'VEC2' ? 2 : accessorType === 'VEC3' ? 3 : accessorType === 'VEC4' ? 4 : 0);
  const size = (componentType === GL_FLOAT ? 4 : componentType === GL_UNSIGNED_SHORT ? 2 : componentType === GL_UNSIGNED_BYTE ? 1 : 0);
  return length * size;
}
