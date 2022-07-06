/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { mat, Mat4, mat4, Vec3, vec3 } from 'munum';
import {
  AddressMode, BindGroup, BindGroupEntry, BindGroupLayout, BindingType, BlendFactor, Buffer, BufferUsage, Canvas,
  CompareFunction, CullMode, FilterMode, IndexFormat, RenderPipeline, PrimitiveTopology, Device, Sampler,
  SamplerDescriptor, ShaderStage, Texture, VertexAttribute, VertexBufferLayout, VertexFormat, WebGL, TextureFormat,
  TextureUsage
} from 'mugl';
import { PRIMITIVE_VERTEX_CODE } from '../shader/primitive.vs.glsl';
import { PBR_FRAGMENT_CODE } from '../shader/pbr.fs.glsl';
import { Accessor, GlTF, Mesh, MeshPrimitive, Node } from '../gltf-spec/glTF2';
import { ResolvedGlTF } from './types';
import { getCameraProjection, getExtras, getAccessorVertexFormat, getAccessorData, isColorVec3 } from './gltf-utils';
import { updateGlTF } from './update';
import * as GLenum from './gl-const';

const ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT', 'TEXCOORD_0', 'TEXCOORD_1', 'COLOR_0', 'JOINTS_0', 'WEIGHTS_0'];
const MAX_TARGET_ATTRIBUTES = 8; // TODO: support more target attributes via CPU compute
const TARGET_ATTRIBUTES = ['POSITION', 'NORMAL', 'TANGENT'];
const TARGET_ATTRIBUTE_START_LOCATION = [8, 12, 14];
const TARGET_ATTRIBUTE_MATCHER = /(POSITION|NORMAL|TANGENT)_(\d+)/;
const DEFAULT_SAMPLER_DESC: SamplerDescriptor = {
  addressModeU: AddressMode.Repeat,
  addressModeV: AddressMode.Repeat,
  magFilter: FilterMode.Linear,
  minFilter: FilterMode.Linear,
};
const MODEL_BUFFER_LENGTH = 52;

const I4 = mat4.create();
const Z3 = vec3.create();

const tmpViewProj = mat4.create();

type NamedVertexBufferLayout = VertexBufferLayout & { attributes: (VertexAttribute & { name: string })[] };

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
 * @param device the GPU device
 * @param glTF the GlTF model resolved via resolveGlTF function
 * @param options optional rendering options
 */
export function renderGlTF(canvas: Canvas, device: Device, glTF: ResolvedGlTF, options: RenderGlTFOptions = {}): void {
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
      proj = getCameraProjection(tmpViewProj, activeCamera, canvas.width / canvas.height);
      cameraPosition = (activeCamera.extras?.translation as Vec3) || Z3;
    }
    if (options.camera.model) {
      cameraPosition = vec3.create(options.camera.model[12], options.camera.model[13], options.camera.model[14]);
      mat4.invert(options.camera.model, view);
    }
    proj = options.camera.proj || proj;
  }

  const viewProj = mat4.mul(proj, view, tmpViewProj);

  // layout(std140) uniform Model {
  //   mat4 model, normalMatrix, viewProj;
  //   vec4 cameraPosition;
  // }
  const model = new Float32Array(MODEL_BUFFER_LENGTH);
  mat.copy(viewProj, model, 0, 32, 16);
  mat.copy(cameraPosition, model, 0, 48, 3);

  // Render all active nodes
  WebGL.beginDefaultPass(device, { clearDepth: 1 });

  const transparentDrawables: { node: Node, mesh: Mesh, primitive: MeshPrimitive }[] = [];

  // Draw opaque primitives
  for (let i = 0; i < activeNodes.length; ++i) {
    const node = nodes[activeNodes[i]];
    const mesh = glTF.meshes?.[node.mesh!];
    if (mesh) {
      // Update mesh uniforms
      loadModelGPUBuffer(device, glTF, node, model);
      loadMorphGPUBuffer(device, glTF, node, mesh, true);
      loadJointGPUTexture(device, glTF, node, true);

      for (let i = 0; i < mesh.primitives.length; ++i) {
        const primitive = mesh.primitives[i];
        if (glTF.materials?.[primitive.material!]?.alphaMode === 'BLEND') {
          transparentDrawables.push({ node, mesh, primitive });
        } else {
          renderGlTFPrimitive(device, glTF, node, mesh, primitive);
        }
      }
    }
  }

  // Draw transparent primitives last
  // TODO: depth sorting, so that the furthest nodes are rendered first
  for (const drawable of transparentDrawables) {
    renderGlTFPrimitive(device, glTF, drawable.node, drawable.mesh, drawable.primitive);
  }

  WebGL.submitRenderPass(device);
}

function renderGlTFPrimitive(
  device: Device, glTF: ResolvedGlTF,
  node: Node, mesh: Mesh, primitive: MeshPrimitive,
): void {
  let indexed = false;
  let offset = 0;
  let vertexCount = glTF.accessors?.[primitive.attributes.POSITION!]?.count || 0;

  // Require positions to render
  if (!vertexCount) {
    return;
  }

  // Bind pipeline
  const pipeline = loadGPUPipeline(device, glTF, primitive);
  WebGL.setRenderPipeline(device, pipeline)

  // Bind groups
  WebGL.setBindGroup(device, 0, loadMaterialBindGroup(device, glTF, primitive.material));
  WebGL.setBindGroup(device, 1, loadModelBindGroup(device, glTF, node, mesh));

  // Bind vertex buffers
  const buffers = getVertexBufferLayouts(glTF, primitive);
  for (let i = 0; i < buffers.length; ++i) {
    const attr = buffers[i].attributes[0].name;
    const targetAttrMatch = TARGET_ATTRIBUTE_MATCHER.exec(attr);
    const buffer = loadGPUBuffer(
      device, glTF,
      targetAttrMatch ? primitive.targets![targetAttrMatch[2] as unknown as number][targetAttrMatch[1]] : primitive.attributes[attr],
      BufferUsage.Vertex
    );
    if (buffer) {
      WebGL.setVertex(device, i, buffer);
    }
  }

  // Bind index buffer
  const indexAccessor = glTF.accessors?.[primitive.indices!];
  if (indexAccessor) {
    const indexBuffer = loadGPUBuffer(device, glTF, primitive.indices, BufferUsage.Index);
    if (indexBuffer) {
      WebGL.setIndex(device, indexBuffer);
      vertexCount = indexAccessor.count;
      offset = (getExtras(indexAccessor).byteOffset as number) || 0;
      indexed = true;
    }
  }

  // Draw
  if (indexed) {
    WebGL.drawIndexed(device, vertexCount, 1, offset);
  } else {
    WebGL.draw(device, vertexCount);
  }
}

function loadGPUPipeline(device: Device, glTF: ResolvedGlTF, primitive: MeshPrimitive): RenderPipeline {
  let pipeline: RenderPipeline | undefined = getExtras(primitive).pipeline as RenderPipeline | undefined;
  if (pipeline) {
    return pipeline;
  }

  const topology: PrimitiveTopology = (primitive.mode as PrimitiveTopology) || PrimitiveTopology.Triangles;
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

  // TODO: better key encoding
  const pipelineKey = JSON.stringify([
    buffers,
    doubleSided,
    alphaMode,
    indexFormat,
    topology,
    unlit
  ]);

  const pipelines: Record<string, RenderPipeline> = getExtras(glTF).pipelines =
    (getExtras(glTF).pipelines as Record<string, RenderPipeline>) || {};
  pipeline = pipelines[pipelineKey];
  if (pipeline) {
    return pipeline;
  }

  const defines: string[] = [
    `ALPHAMODE_${alphaMode}`
  ];
  for (const buffer of buffers) {
    for (const attr of buffer.attributes) {
      defines.push(`USE_${attr.name}`);
      if (attr.name === 'COLOR_0' && isColorVec3(attr.format)) {
        defines.push('COLOR_0_VEC3');
      }
    }
  }
  if (unlit) {
    defines.push('MATERIAL_UNLIT');
  }
  const defineStr = defines.map(define => `#define ${define}\n`).join('');
  const versionStr = '#version 300 es\n';
  const vertexCode = versionStr + defineStr + PRIMITIVE_VERTEX_CODE.replace(versionStr, '');
  const fragmentCode = versionStr + defineStr + PBR_FRAGMENT_CODE.replace(versionStr, '');

  const vertex = WebGL.createShader(device, { usage: ShaderStage.Vertex, code: vertexCode });
  const fragment = WebGL.createShader(device, { usage: ShaderStage.Fragment, code: fragmentCode });

  pipeline = getExtras(primitive).pipeline = pipelines[pipelineKey] = WebGL.createRenderPipeline(device, {
    vertex,
    fragment,
    buffers,
    bindGroups: [
      loadMaterialBindGroupLayout(device, glTF),
      loadModelBindGroupLayout(device, glTF),
    ],
    primitive: {
      indexFormat,
      topology,
      cullMode: doubleSided ? CullMode.None : CullMode.Back
    },
    depthStencil: {
      depthCompare: CompareFunction.LessEqual,
      depthWrite: !(alphaMode === 'BLEND')
    },
    targets: (alphaMode === 'BLEND') ? {
      blendColor: {
        srcFactor: BlendFactor.SrcAlpha,
        dstFactor: BlendFactor.OneMinusSrcAlpha,
      },
      blendAlpha: {
        srcFactor: BlendFactor.One,
        dstFactor: BlendFactor.OneMinusSrcAlpha,
      }
    } : null,
  });

  vertex.destroy();
  fragment.destroy();

  return pipeline;
}

function getVertexBufferLayouts(glTF: ResolvedGlTF, primitive: MeshPrimitive): NamedVertexBufferLayout[] {
  const bufferIdMap: Record<string, number> = {};
  const buffers: NamedVertexBufferLayout[] = [];

  if (getExtras(primitive).bufferLayouts) {
    return getExtras(primitive).bufferLayouts as NamedVertexBufferLayout[];
  }

  function getBufferLayoutDescriptor(accessor: Accessor): NamedVertexBufferLayout {
    if (!accessor.sparse) {
      const buffer = getAccessorData(glTF, accessor).buffer;
      const bufferKey = `${accessor.bufferView},${buffer.byteOffset},${buffer.byteLength}`;

      if (bufferKey in bufferIdMap) {
        return buffers[bufferIdMap[bufferKey]];
      }

      bufferIdMap[bufferKey] = buffers.length;
    }

    const bufferLayout = {
      attributes: [],
      stride: glTF.bufferViews?.[accessor.bufferView!]?.byteStride || 0 // TODO: will byteStride ever be undefined?
    };
    buffers.push(bufferLayout);

    return bufferLayout;
  }

  // Standard attributes
  for (let shaderLocation = 0; shaderLocation < ATTRIBUTES.length; ++shaderLocation) {
    const accessor = glTF.accessors?.[primitive.attributes[ATTRIBUTES[shaderLocation]]];
    if (accessor) {
      const format = getAccessorVertexFormat(accessor);
      if (!format) {
        // TODO: Support all formats?
        continue;
      }

      getBufferLayoutDescriptor(accessor).attributes.push({
        name: ATTRIBUTES[shaderLocation],
        format,
        shaderLocation,
        offset: (getExtras(accessor).byteOffset as number) || 0
      });
    }
  }

  // Morph target attributes
  if (primitive.targets) {
    const accessors: (Accessor | undefined)[] = new Array(3);
    let maxTargets = MAX_TARGET_ATTRIBUTES;
    for (let i = 0; i < Math.min(primitive.targets.length, maxTargets); ++i) {
      let attrCount = 0;
      for (let j = 0; j < TARGET_ATTRIBUTES.length; ++j) {
        if ((accessors[j] = glTF.accessors?.[primitive.targets[i][TARGET_ATTRIBUTES[j]]])) {
          ++attrCount;
        }
      }
      maxTargets = (MAX_TARGET_ATTRIBUTES / attrCount) | 0;

      for (let j = 0; j < TARGET_ATTRIBUTES.length; ++j) {
        const accessor = accessors[j];
        if (accessor) {
          getBufferLayoutDescriptor(accessor).attributes.push({
            name: `${TARGET_ATTRIBUTES[j]}_${i}`,
            format: VertexFormat.F32x3,
            shaderLocation: TARGET_ATTRIBUTE_START_LOCATION[j] + i,
            offset: (getExtras(accessor).byteOffset as number) || 0
          });
        }
      }
    }
  }

  getExtras(primitive).bufferLayouts = buffers;
  return buffers;
}

function loadGPUBuffer(device: Device, glTF: ResolvedGlTF, accessorId: number | undefined, usage: BufferUsage): Buffer | null {
  const accessor = glTF.accessors?.[accessorId!];
  if (!accessor) {
    return null;
  }

  // sparse accessor uses its own buffer
  // ubyte index is not supported in mugl, thus uses its own widened buffer
  const isUByteIndex = (usage & BufferUsage.Index) && accessor.componentType === GLenum.UNSIGNED_BYTE;
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

      gpuBuffer = getExtras(accessor).gpuBuffer = WebGL.createBuffer(device, { usage, size: data.byteLength });
      WebGL.writeBuffer(device, gpuBuffer, data);
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

  if (!gpuBuffers[bufferKey]) {
    gpuBuffers[bufferKey] = WebGL.createBuffer(device, { usage, size: buffer.byteLength });
    WebGL.writeBuffer(device, gpuBuffers[bufferKey], buffer);
  }

  return gpuBuffers[bufferKey];
}

function loadGPUTexture(device: Device, glTF: ResolvedGlTF, textureId: number, format: TextureFormat = TextureFormat.RGBA8): Texture {
  let img: HTMLImageElement | null = null;
  const texture = glTF.textures?.[textureId];
  const image = glTF.images?.[texture?.source!];
  if (image) {
    img = image.extras.image;
  }

  if (!texture || !img) {
    return loadBlankGPUTexture(device, glTF);
  }

  let gpuTexture: Texture | undefined = getExtras(texture).texture as Texture | undefined;
  if (!gpuTexture) {
    gpuTexture = getExtras(texture).texture = WebGL.createTexture(device, {
      format,
      size: [img.naturalWidth || 1, img.naturalHeight || 1, 1],
      usage: TextureUsage.TextureBinding,
    });
    WebGL.copyExternalImageToTexture(device, { src: img }, { texture: gpuTexture });
  }
  return gpuTexture;
}

function loadGPUSampler(device: Device, glTF: ResolvedGlTF, textureId: number): Sampler {
  const texture = glTF.textures?.[textureId];
  const sampler = glTF.samplers?.[texture?.sampler!];
  if (!sampler) {
    return loadDefaultGPUSampler(device, glTF);
  }

  let gpuSampler: Sampler | undefined = getExtras(sampler).sampler as Sampler | undefined;
  if (!gpuSampler) {
    const samplerDesc: SamplerDescriptor = { ...DEFAULT_SAMPLER_DESC };
    samplerDesc.addressModeU = sampler.wrapS as AddressMode || samplerDesc.addressModeU;
    samplerDesc.addressModeV = sampler.wrapT as AddressMode || samplerDesc.addressModeV;
    samplerDesc.magFilter = sampler.magFilter as FilterMode || samplerDesc.magFilter;

    switch (sampler.minFilter) {
      case GLenum.NEAREST_MIPMAP_NEAREST:
        samplerDesc.minFilter = FilterMode.Nearest;
        samplerDesc.mipmapFilter = FilterMode.Nearest;
        break;
      case GLenum.NEAREST_MIPMAP_LINEAR:
        samplerDesc.minFilter = FilterMode.Nearest;
        samplerDesc.mipmapFilter = FilterMode.Linear;
        break;
      case GLenum.LINEAR_MIPMAP_NEAREST:
        samplerDesc.minFilter = FilterMode.Linear;
        samplerDesc.mipmapFilter = FilterMode.Nearest;
      case GLenum.LINEAR_MIPMAP_LINEAR:
        samplerDesc.minFilter = FilterMode.Linear;
        samplerDesc.mipmapFilter = FilterMode.Linear;
        break;
      default:
        samplerDesc.minFilter = sampler.minFilter;
    }
    gpuSampler = getExtras(sampler).sampler = WebGL.createSampler(device, samplerDesc);
  }

  return gpuSampler;
}

/** Load a placeholder texture. */
function loadBlankGPUTexture(device: Device, glTF: GlTF): Texture {
  let gpuTexture: Texture | undefined = getExtras(glTF).blankTexture as Texture | undefined;
  if (gpuTexture) {
    return gpuTexture;
  }

  gpuTexture = getExtras(glTF).blankTexture = WebGL.createTexture(device, { usage: TextureUsage.TextureBinding });
  WebGL.writeTexture(device, { texture: gpuTexture }, new Uint8Array([255, 255, 255, 255]), { bytesPerRow: 4 });
  return gpuTexture;
}

/** Load a default sampler. */
function loadDefaultGPUSampler(device: Device, glTF: GlTF): Sampler {
  let gpuSampler: Sampler | undefined = getExtras(glTF).defaultSampler as Sampler | undefined;
  if (!gpuSampler) {
    gpuSampler = getExtras(glTF).defaultSampler = WebGL.createSampler(device, DEFAULT_SAMPLER_DESC);
  }
  return gpuSampler;
}

function loadModelBindGroupLayout(device: Device, glTF: GlTF): BindGroupLayout {
  let layout: BindGroupLayout | undefined = getExtras(glTF).modelLayout as BindGroupLayout | undefined;
  if (!layout) {
    layout = getExtras(glTF).modelLayout = WebGL.createBindGroupLayout(device, {
      entries: [
        { binding: 0, label: 'Model', type: BindingType.Buffer },
        { binding: 1, label: 'Morph', type: BindingType.Buffer },
        { binding: 2, label: 'jointTexture', type: BindingType.Texture },
        { binding: 3, label: 'jointTexture', type: BindingType.Sampler },
      ]
    });
  }
  return layout;
}

function loadMaterialBindGroupLayout(device: Device, glTF: GlTF): BindGroupLayout {
  let layout: BindGroupLayout | undefined = getExtras(glTF).materialLayout as BindGroupLayout | undefined;
  if (!layout) {
    layout = getExtras(glTF).materialLayout = WebGL.createBindGroupLayout(device, {
      entries: [
        { binding: 0, label: 'Material', type: BindingType.Buffer },
        { binding: 1, label: 'baseColorTexture', type: BindingType.Texture },
        { binding: 2, label: 'baseColorTexture', type: BindingType.Sampler },
        { binding: 3, label: 'metallicRoughnessTexture', type: BindingType.Texture },
        { binding: 4, label: 'metallicRoughnessTexture', type: BindingType.Sampler },
        { binding: 5, label: 'normalTexture', type: BindingType.Texture },
        { binding: 6, label: 'normalTexture', type: BindingType.Sampler },
        { binding: 7, label: 'occlusionTexture', type: BindingType.Texture },
        { binding: 8, label: 'occlusionTexture', type: BindingType.Sampler },
        { binding: 9, label: 'emissiveTexture', type: BindingType.Texture },
        { binding: 10, label: 'emissiveTexture', type: BindingType.Sampler },
      ]
    });
  }
  return layout;
}

function loadMaterialBindGroup(device: Device, glTF: ResolvedGlTF, materialId: number | undefined): BindGroup {
  const material = glTF.materials?.[materialId!];

  if (material && getExtras(material).bindGroup) {
    return getExtras(material).bindGroup as BindGroup;
  } else if (!material && getExtras(glTF).defaultMaterialBindGroup) {
    return getExtras(glTF).defaultMaterialBindGroup as BindGroup;
  }

  /*
    layout(std140) uniform Material {
      vec4 baseColorFactor;
      float metallicFactor, roughnessFactor;
      float baseColorTexCoord, metallicRoughnessTexCoord;
      float normalScale, normalTexCoord;
      float occlusionStrength, occlusionTexCoord;
      vec4 emissiveFactorTexCoord;
      float alphaCutoff;
      // floatx3 padding
    };
  */
  const materialData = new Float32Array(20);
  materialData[0] = materialData[1] = materialData[2] = materialData[3] = 1; // baseColorFactor
  materialData[4] = 1; // metallicFactor
  materialData[5] = 1; // roughnessFactor
  materialData[6] = materialData[7] = materialData[9] = materialData[11] = materialData[15] = -1; // tex coords
  materialData[8] = 1; // normalScale
  materialData[10] = 0; // occlusionStrength
  materialData[12] = materialData[13] = materialData[14] = 0; // emissiveFactor
  materialData[16] = 0.5; // alphaCutoff

  const materialBuffer = WebGL.createBuffer(device, { usage: BufferUsage.Uniform, size: materialData.byteLength });
  if (material) {
    getExtras(material).gpuBuffer = materialBuffer;
  }

  const entries: BindGroupEntry[] = [
    { binding: 0, buffer: materialBuffer }, // Material
    { binding: 1, texture: loadBlankGPUTexture(device, glTF) }, // baseColorTexture
    { binding: 2, sampler: loadDefaultGPUSampler(device, glTF) }, // baseColorTexture
    { binding: 3, texture: loadBlankGPUTexture(device, glTF) }, // metallicRoughnessTexture
    { binding: 4, sampler: loadDefaultGPUSampler(device, glTF) }, // metallicRoughnessTexture
    { binding: 5, texture: loadBlankGPUTexture(device, glTF) }, // normalTexture
    { binding: 6, sampler: loadDefaultGPUSampler(device, glTF) }, // normalTexture
    { binding: 7, texture: loadBlankGPUTexture(device, glTF) }, // occlusionTexture
    { binding: 8, sampler: loadDefaultGPUSampler(device, glTF) }, // occlusionTexture
    { binding: 9, texture: loadBlankGPUTexture(device, glTF) }, // emissiveTexture
    { binding: 10, sampler: loadDefaultGPUSampler(device, glTF) }, // emissiveTexture
  ];

  if (material) {
    if (material.pbrMetallicRoughness) {
      const pbr = material.pbrMetallicRoughness;
      if (pbr.baseColorFactor) {
        mat.copy(pbr.baseColorFactor, materialData, 0, 0, 4);
      }
      if (pbr.metallicFactor || pbr.metallicFactor === 0) {
        materialData[4] = pbr.metallicFactor;
      }
      if (pbr.roughnessFactor || pbr.roughnessFactor === 0) {
        materialData[5] = pbr.roughnessFactor;
      }
      if (pbr.baseColorTexture) {
        entries[1].texture = loadGPUTexture(device, glTF, pbr.baseColorTexture.index, TextureFormat.SRGBA8);
        entries[2].sampler = loadGPUSampler(device, glTF, pbr.baseColorTexture.index);
        materialData[6] = pbr.baseColorTexture.texCoord || 0;
      }
      if (pbr.metallicRoughnessTexture) {
        entries[3].texture = loadGPUTexture(device, glTF, pbr.metallicRoughnessTexture.index);
        entries[4].sampler = loadGPUSampler(device, glTF, pbr.metallicRoughnessTexture.index);
        materialData[7] = pbr.metallicRoughnessTexture.texCoord || 0;
      }
    }
    if (material.normalTexture) {
      entries[5].texture = loadGPUTexture(device, glTF, material.normalTexture.index);
      entries[6].sampler = loadGPUSampler(device, glTF, material.normalTexture.index);
      materialData[8] = material.normalTexture.scale ?? 1;
      materialData[9] = material.normalTexture.texCoord || 0;
    }
    if (material.occlusionTexture) {
      entries[7].texture = loadGPUTexture(device, glTF, material.occlusionTexture.index);
      entries[8].sampler = loadGPUSampler(device, glTF, material.occlusionTexture.index);
      materialData[10] = material.occlusionTexture.strength || 0;
      materialData[11] = material.occlusionTexture.texCoord || 0;
    }
    if (material.emissiveFactor) {
      mat.copy(material.emissiveFactor, materialData, 0, 12, 3);
    }
    if (material.emissiveTexture) {
      entries[9].texture = loadGPUTexture(device, glTF, material.emissiveTexture.index, TextureFormat.SRGBA8);
      entries[10].sampler = loadGPUSampler(device, glTF, material.emissiveTexture.index);
      materialData[15] = material.emissiveTexture.texCoord || 0;
    }
    if (material.alphaCutoff || material.alphaCutoff === 0) {
      materialData[16] = material.alphaCutoff;
    }
  }

  WebGL.writeBuffer(device, materialBuffer, materialData);

  const bindGroup = WebGL.createBindGroup(device, {
    layout: loadMaterialBindGroupLayout(device, glTF),
    entries,
  });
  if (material) {
    getExtras(material).bindGroup = bindGroup;
  } else {
    getExtras(glTF).defaultMaterialBindGroup = bindGroup;
  }

  return bindGroup;
}

function loadModelBindGroup(device: Device, glTF: ResolvedGlTF, node: Node, mesh: Mesh): BindGroup {
  if (getExtras(node).modelBindGroup) {
    return getExtras(node).modelBindGroup as BindGroup;
  }

  const entries: BindGroupEntry[] = [
    { binding: 0, buffer: loadModelGPUBuffer(device, glTF, node) },
    { binding: 1, buffer: loadMorphGPUBuffer(device, glTF, node, mesh) },
    { binding: 2, texture: loadJointGPUTexture(device, glTF, node) },
    { binding: 3, sampler: loadJointGPUSampler(device, glTF) },
  ];

  const bindGroup = getExtras(node).modelBindGroup = WebGL.createBindGroup(device, {
    layout: loadModelBindGroupLayout(device, glTF),
    entries,
  });

  return bindGroup;
}

function loadModelGPUBuffer(
  device: Device, glTF: ResolvedGlTF,
  node: Node, data: Float32Array | null = null
): Buffer {
  let buffer = getExtras(node).modelBuffer as Buffer | undefined;
  if (!buffer) {
    buffer = getExtras(node).modelBuffer = WebGL.createBuffer(device, {
      usage: BufferUsage.Uniform | BufferUsage.Stream,
      size: MODEL_BUFFER_LENGTH * 4,
    });
  }

  if (data) {
    const model = new Float32Array(data.buffer, 0, 16) as unknown as Mat4;
    mat.copy((getExtras(node).model as Mat4) || I4, model, 0, 0, 16);
    const normalMatrix = new Float32Array(data.buffer, 16 * 4, 16) as unknown as Mat4;
    const normalMat3 = mat4.nmat3(model);

    if (normalMat3) {
      mat4.fromMat3(normalMat3, normalMatrix);
    } else {
      mat.copy(model, normalMatrix, 0, 0, 16);
    }
    WebGL.writeBuffer(device, buffer, data);
  }

  return buffer;
}

function loadDefaultMorphGPUBuffer(device: Device, glTF: GlTF): Buffer {
  let buffer = getExtras(glTF).morphBuffer as Buffer | undefined;
  if (!buffer) {
    buffer = getExtras(glTF).morphBuffer = WebGL.createBuffer(device, {
      usage: BufferUsage.Uniform,
      size: MAX_TARGET_ATTRIBUTES * 4,
    });
  }
  return buffer;
}

function loadMorphGPUBuffer(
  device: Device, glTF: ResolvedGlTF, node: Node, mesh: Mesh, update: boolean = false
): Buffer {
  const targetWeights = (getExtras(node).weights as number[]) || node.weights || mesh.weights;
  if (!targetWeights) {
    return loadDefaultMorphGPUBuffer(device, glTF);
  }

  let buffer = getExtras(node).morphBuffer as Buffer | undefined;
  if (!buffer) {
    buffer = getExtras(node).morphBuffer = WebGL.createBuffer(device, {
      usage: BufferUsage.Uniform | BufferUsage.Stream,
      size: MAX_TARGET_ATTRIBUTES * 4,
    });
  }
  if (update) {
    const data = new Float32Array(MAX_TARGET_ATTRIBUTES);
    mat.copy(targetWeights, data, 0, 0, MAX_TARGET_ATTRIBUTES);
    WebGL.writeBuffer(device, buffer, data);
  }

  return buffer;
}

function loadJointGPUTexture(device: Device, glTF: GlTF, node: Node, update: boolean = false): Texture {
  const skin = glTF.skins?.[node.skin!];
  if (!skin) {
    return loadBlankGPUTexture(device, glTF);
  }

  let numJoints = skin.joints.length;
  let gpuTexture: Texture | undefined = getExtras(node).jointTexture as Texture | undefined;
  if (!gpuTexture) {
    gpuTexture = getExtras(node).jointTexture = WebGL.createTexture(device, {
      size: [4, numJoints, 1],
      format: TextureFormat.RGBA32F,
      usage: TextureUsage.TextureBinding,
    });
  }

  if (update) {
    const jointMatrix = getExtras(node).jointMatrix = (getExtras(node).jointMatrix as Float32Array) || new Float32Array(numJoints * 16);
    WebGL.writeTexture(device, { texture: gpuTexture }, jointMatrix, {
      bytesPerRow: 4 * 16,
      rowsPerImage: numJoints,
    }, [4, numJoints, 1]);
  }

  return gpuTexture;
}

function loadJointGPUSampler(device: Device, glTF: GlTF): Sampler {
  let gpuSampler: Sampler | undefined = getExtras(glTF).jointSampler as Sampler | undefined;
  if (!gpuSampler) {
    gpuSampler = getExtras(glTF).jointSampler = WebGL.createSampler(device, {});
  }
  return gpuSampler;
}
