import { MUGL_DEBUG } from '../config';
import * as GLenum from './gl-const';
import { Color, Extent2D, Extent3D, Float, Future, UInt, UIntArray } from './primitive';
import {
  BindingType, BufferUsage, ColorWrite, MipmapHint, ShaderStage, TextureUsage
} from './type';
import {
  BindGroupDescriptor, BindGroupEntry, BindGroupLayoutDescriptor, BindGroupLayoutEntry, BufferDescriptor,
  DefaultRenderPassDescriptor, ImageCopyExternalImage, ImageCopyTexture, ImageDataLayout, RenderPassDescriptor,
  RenderPipelineDescriptor, RenderPipelineState, SamplerDescriptor, ShaderDescriptor, TextureDescriptor, TextureView,
  VertexBufferLayout
} from './descriptor';
import {
  BindGroup, BindGroupLayout, Buffer, Device, RenderPass, RenderPipeline, Sampler, Shader, Texture
} from './resource';
import { Canvas, WebGL2Feature, WebGL2FeatureNames } from './gl2-type';
import {
  glClearType, glTexelFormat, glTexelSize, glTexelType, hasStencil, indexByteSize, is3DTexture, isDepthStencil,
  vertexSize, vertexType, vertexNormalized,
} from './gl-util';

//#region Constants

const BYTE_MASK = 0xFF;
const STENCIL_MASK = 0xFFFFFFFF;
const MAX_VERTEX_ATTRIBS = 16;  // TODO: query the actual limit

//#endregion Constants

//#region Types

interface WebGL2Device extends Device {
  readonly canvas: Canvas;
  readonly gl: WebGL2RenderingContext;
  readonly features: WebGL2Feature;

  pass: WebGL2RenderPass | null;
  state: WebGL2State;
}

interface WebGL2Buffer extends Buffer {
  readonly gl: WebGL2RenderingContext;
  readonly glb: WebGLBuffer | null;
  readonly type: UInt;
  readonly size: UInt;
}

interface WebGL2Texture extends Texture {
  readonly gl: WebGL2RenderingContext;
  readonly glt: WebGLTexture | null;
  readonly glrb: WebGLRenderbuffer | null;
  readonly type: UInt;
  readonly width: UInt;
  readonly height: UInt;
  readonly depth: UInt;
  readonly format: UInt;
  readonly samples: UInt;
}

interface WebGL2Sampler extends Sampler {
  readonly gl: WebGL2RenderingContext;
  readonly gls: WebGLSampler | null;
}

interface WebGL2Shader extends Shader {
  readonly gl: WebGL2RenderingContext;
  readonly gls: WebGLShader | null;
}

interface WebGL2RenderPass extends RenderPass {
  readonly gl: WebGL2RenderingContext;
  readonly glfb: WebGLFramebuffer | null;
  readonly glrfb: (WebGLFramebuffer | null)[];
  readonly color: WebGL2Texture[];
  readonly clearColors: (Color | null | undefined)[];
  readonly clearColor?: Color | null;
  readonly clearDepth?: Float;
  readonly clearStencil?: Float;
  readonly depth: WebGL2Texture | null;
}

interface WebGL2BindGroupLayout extends BindGroupLayout {
  readonly entries: (BindGroupLayoutEntry & { binding: UInt })[];
}

interface WebGL2BindGroup extends BindGroup {
  readonly entries: (BindGroupEntry & { binding: UInt })[];
}

interface WebGL2RenderPipeline extends RenderPipeline {
  readonly gl: WebGL2RenderingContext;
  readonly glp: WebGLProgram | null;
  readonly cache: UniformCache[][];
  readonly buffers: VertexBufferLayout[];
  readonly state: WebGL2PipelineState;
}

//#endregion Types

//#region Device

/**
 * Requests a WebGL2 {@link Device}.
 * @param canvas the canvas to be used
 * @param options WebGL context initialization options
 * @param features WebGL features to enable
 * @returns WebGL2 GPU device instance, or null if WebGL2 is not supported
 */
export function requestWebGL2Device(
  canvas: Canvas, options: WebGLContextAttributes = {}, features: WebGL2Feature = 0
): Device | null {
  const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2', options);
  if (gl) {
    let enabledFeatures = 0;
    for (const feature in WebGL2FeatureNames) {
      if ((features & +feature) && gl.getExtension(WebGL2FeatureNames[+feature])) {
        enabledFeatures = enabledFeatures | +feature;
      }
    }
    return {
      canvas, gl, features: enabledFeatures,
      pass: null,
      state: initWebGL2State(gl),
      destroy() {
        this.gl.deleteFramebuffer(this.state.copyFrameBuffer);
      }
    } as WebGL2Device;
  }
  return null;
}

/**
 * Resets the device state.
 * @param device the GPU device
 */
export function resetDevice(device: Device): void {
  (device as WebGL2Device).destroy();
  (device as WebGL2Device).state = initWebGL2State((device as WebGL2Device).gl);
}

/**
 * Returns if device context is lost.
 * @param device the GPU device
 * @returns true if device context is lost
 */
export function isDeviceLost(device: Device): boolean {
  return (device as WebGL2Device).gl.isContextLost();
}

/**
 * Gets the enabled features of the device.
 * @param device the GPU device
 * @returns enabled features bitflag
 */
export function getDeviceFeatures(device: Device): WebGL2Feature {
  return (device as WebGL2Device).features;
}

//#endregion Device

//#region Buffer

/**
 * Creates a new buffer object.
 * @param device the GPU device
 * @param desc the buffer descriptor
 * @returns new buffer object
 */
export function createBuffer(device: Device, desc: BufferDescriptor): Buffer {
  const type = (desc.usage & BufferUsage.Uniform) ? GLenum.UNIFORM_BUFFER :
    (desc.usage & BufferUsage.Index) ? GLenum.ELEMENT_ARRAY_BUFFER : GLenum.ARRAY_BUFFER;
  const usage = (desc.usage & BufferUsage.Stream) ? GLenum.STREAM_DRAW :
    (desc.usage & BufferUsage.Dynamic) ? GLenum.DYNAMIC_DRAW : GLenum.STATIC_DRAW;

  const glb = (device as WebGL2Device).gl.createBuffer();
  (device as WebGL2Device).gl.bindBuffer(type, glb);
  (device as WebGL2Device).gl.bufferData(type, desc.size, usage);

  return {
    gl: (device as WebGL2Device).gl, glb, type, size: desc.size,
    destroy(): void {
      this.gl.deleteBuffer(this.glb);
    }
  } as WebGL2Buffer;
}

//#endregion Buffer

//#region Texture

/**
 * Creates a new texture object.
 * @param device the GPU device
 * @param desc the texture descriptor
 * @returns new texture object
 */
export function createTexture(device: Device, desc: TextureDescriptor): Texture {
  const samples = desc.sampleCount || 1;
  const type = desc.dimension || GLenum.TEXTURE_2D;
  const format = desc.format || GLenum.RGBA8;
  const needTexture = !isDepthStencil(format) || ((desc.usage || 0) & TextureUsage.TextureBinding);
  const [width, height, _depth] = desc.size || [1, 1, 1];
  const depth = type === GLenum.TEXTURE_CUBE_MAP ? 6 :
    type === GLenum.TEXTURE_2D ? 1 : _depth;

  let glt = null;
  let glrb = null;

  if (samples > 1 || !needTexture) { // MSAA / Depth-stencil renderbuffer
    // WebGL does not have multisample texture, so renderbuffer is needed to resolve MSAA
    glrb = (device as WebGL2Device).gl.createRenderbuffer();
    (device as WebGL2Device).gl.bindRenderbuffer(GLenum.RENDERBUFFER, glrb);
    if (samples > 1) {
      (device as WebGL2Device).gl.renderbufferStorageMultisample(GLenum.RENDERBUFFER, samples, format, width, height);
    } else {
      (device as WebGL2Device).gl.renderbufferStorage(GLenum.RENDERBUFFER, format, width, height);
    }
  }

  if (needTexture) {
    glt = (device as WebGL2Device).gl.createTexture();
    (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0);
    (device as WebGL2Device).gl.bindTexture(type, glt);

    if (is3DTexture(type)) {
      (device as WebGL2Device).gl.texStorage3D(type, desc.mipLevelCount || 1, format, width, height, depth);
    } else {
      (device as WebGL2Device).gl.texStorage2D(type, desc.mipLevelCount || 1, format, width, height);
    }
  }

  return {
    gl: (device as WebGL2Device).gl, glt, glrb, type, format, width, height, depth, samples,
    destroy(): void {
      this.gl.deleteTexture(this.glt);
      this.gl.deleteRenderbuffer(this.glrb);
    }
  } as WebGL2Texture;
}

//#endregion Texture

//#region Sampler

/**
 * Creates a new sampler object.
 * @param device the GPU device
 * @param desc the sampler descriptor
 * @returns new sampler object
 */
export function createSampler(device: Device, desc: SamplerDescriptor = {}): Sampler {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const gls = (device as WebGL2Device).gl.createSampler()!;
  let minFilter = desc.minFilter || GLenum.NEAREST;
  if (desc.mipmapFilter) {
    if (desc.mipmapFilter === GLenum.NEAREST) {
      minFilter = minFilter === GLenum.NEAREST ? GLenum.NEAREST_MIPMAP_NEAREST : GLenum.LINEAR_MIPMAP_NEAREST;
    } else {
      minFilter = minFilter === GLenum.NEAREST ? GLenum.NEAREST_MIPMAP_LINEAR : GLenum.LINEAR_MIPMAP_LINEAR;
    }
  }

  (device as WebGL2Device).gl.samplerParameteri(gls, GLenum.TEXTURE_MIN_FILTER, minFilter);
  (device as WebGL2Device).gl.samplerParameteri(gls, GLenum.TEXTURE_MAG_FILTER, desc.magFilter || GLenum.NEAREST);
  (device as WebGL2Device).gl.samplerParameteri(gls, GLenum.TEXTURE_WRAP_S, desc.addressModeU || GLenum.CLAMP_TO_EDGE);
  (device as WebGL2Device).gl.samplerParameteri(gls, GLenum.TEXTURE_WRAP_T, desc.addressModeV || GLenum.CLAMP_TO_EDGE);
  (device as WebGL2Device).gl.samplerParameteri(gls, GLenum.TEXTURE_WRAP_R, desc.addressModeW || GLenum.CLAMP_TO_EDGE);
  (device as WebGL2Device).gl.samplerParameterf(gls, GLenum.TEXTURE_MAX_LOD, desc.lodMaxClamp || 32);
  (device as WebGL2Device).gl.samplerParameterf(gls, GLenum.TEXTURE_MIN_LOD, desc.lodMinClamp || 0);
  if (desc.compare) {
    (device as WebGL2Device).gl.samplerParameterf(gls, GLenum.TEXTURE_COMPARE_MODE, GLenum.COMPARE_REF_TO_TEXTURE);
    (device as WebGL2Device).gl.samplerParameterf(gls, GLenum.TEXTURE_COMPARE_FUNC, desc.compare);
  }
  if ((desc.maxAnisotropy || 1) > 1) {
    (device as WebGL2Device).gl.samplerParameterf(
      gls,
      GLenum.TEXTURE_MAX_ANISOTROPY_EXT,
      Math.min(desc.maxAnisotropy || 1, (device as WebGL2Device).gl.getParameter(GLenum.MAX_TEXTURE_MAX_ANISOTROPY_EXT))
    );
  }

  return {
    gls,
    gl: (device as WebGL2Device).gl,
    destroy(): void {
      this.gl.deleteSampler(this.gls);
    }
  } as WebGL2Sampler;
}

//#endregion Sampler

//#region Shader

/**
 * Creates a new shader module object.
 * @param device the GPU device
 * @param desc the shader descriptor
 * @returns new shader object
 */
export function createShader(device: Device, desc: ShaderDescriptor): Shader {
  const type = desc.usage === ShaderStage.Vertex ? GLenum.VERTEX_SHADER : GLenum.FRAGMENT_SHADER
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const gls = (device as WebGL2Device).gl.createShader(type)!;
  (device as WebGL2Device).gl.shaderSource(gls, desc.code);
  (device as WebGL2Device).gl.compileShader(gls);

  if (MUGL_DEBUG) {
    console.assert(
      (device as WebGL2Device).gl.getShaderParameter(gls, GLenum.COMPILE_STATUS) || isDeviceLost(device),
      `Failed to compile shader: ${(device as WebGL2Device).gl.getShaderInfoLog(gls)}`
    );
  }

  return {
    gl: (device as WebGL2Device).gl,
    gls,
    destroy(): void {
      this.gl.deleteShader(this.gls);
    }
  } as WebGL2Shader;
}

//#endregion Buffer

//#region RenderPass

/**
 * Creates a new render pass object.
 * @param device the GPU device
 * @param desc the render pass descriptor.
 * @returns new render pass
 */
export function createRenderPass(device: Device, desc: RenderPassDescriptor = {}): RenderPass {
  let glfb: WebGLFramebuffer | null = null;
  const glrfb: (WebGLFramebuffer | null)[] = [];
  const depth = desc.depthStencil ? (desc.depthStencil.texture as WebGL2Texture) : null;
  const withStencil = (depth && hasStencil(depth.format)) || false;

  if (desc.colors && desc.colors.length) {
    // An offscreen pass, need to create a framebuffer with color- and depth attachments
    glfb = (device as WebGL2Device).gl.createFramebuffer();
    (device as WebGL2Device).gl.bindFramebuffer(GLenum.FRAMEBUFFER, glfb);

    for (let i = 0; i < desc.colors.length; ++i) {
      if ((desc.colors[i].view.texture as WebGL2Texture).samples > 1) {
        // Attach multisample renderbuffer for MSAA offscreen rendering
        (device as WebGL2Device).gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER, GLenum.COLOR_ATTACHMENT0 + i, GLenum.RENDERBUFFER,
          (desc.colors[i].view.texture as WebGL2Texture).glrb);
      } else {
        framebufferTexture((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0 + i, desc.colors[i].view);
      }
    }

    // TODO: [Feature] implement multiview
    if (desc.colors.length > 1) {
      (device as WebGL2Device).gl.drawBuffers(desc.colors.map((_, i) => GLenum.COLOR_ATTACHMENT0 + i));
    }

    // Attach optional depth-stencil buffer to framebuffer
    if (depth) {
      if (depth.glrb) { // Use renderbuffer if exist
        (device as WebGL2Device).gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER, withStencil ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT,
          GLenum.RENDERBUFFER, depth.glrb);
      } else { // Use depth texture
        if (MUGL_DEBUG && !isDepthStencil(depth.format)) {
          console.error('Invalid depth texture format', depth);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        framebufferTexture((device as WebGL2Device).gl, withStencil ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT, desc.depthStencil!);
      }
    }

    if (MUGL_DEBUG) {
      console.assert(
        (device as WebGL2Device).gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || isDeviceLost(device),
        'Framebuffer completeness check failed'
      );
    }

    // WebGL has no support for multisample textures. We will render to MSAA renderbuffers
    // and blit to the resolve renderbuffers which have textures attached.
    for (let i = 0; i < desc.colors.length; ++i) {
      glrfb.push((desc.colors[i].view.texture as WebGL2Texture).samples > 1 ?
        createResolveFrameBuffer((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0, desc.colors[i].view) : null);
    }
    glrfb.push(depth && depth.samples > 1 && depth.glt ?
      createResolveFrameBuffer((device as WebGL2Device).gl, withStencil ?
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT, desc.depthStencil!) : null);
  }

  return {
    gl: (device as WebGL2Device).gl,
    glfb, glrfb, depth,
    color: desc.colors ? desc.colors.map((c) => c.view.texture as WebGL2Texture) : [],
    clearColors: desc.colors ? desc.colors.map((c) => c.clear) : [],
    clearColor: desc.clearColor,
    clearDepth: desc.clearDepth,
    clearStencil: desc.clearStencil,
    destroy(): void {
      this.gl.deleteFramebuffer(this.glfb);
      for (const glrfb of this.glrfb) {
        this.gl.deleteFramebuffer(glrfb);
      }
    }
  } as WebGL2RenderPass;
}

//#endregion RenderPass

//#region BindGroup

/**
 * Creates a new pipeline bind group layout object.
 * @param device the GPU device
 * @param desc the bind group layout descriptor
 * @returns new bind group layout object
 */
export function createBindGroupLayout(device: Device, desc: BindGroupLayoutDescriptor): BindGroupLayout {
  return {
    entries: desc.entries.map((entry, binding) => ({ binding, ...entry })),
    destroy(): void {
      // noop
    }
  } as WebGL2BindGroupLayout;
}

/**
 * Creates a new pipeline bind group object.
 * @param device the GPU device
 * @param desc the bind group descriptor
 * @returns new bind group object
 */
export function createBindGroup(device: Device, desc: BindGroupDescriptor): BindGroup {
  return {
    entries: desc.entries.map((entry, binding) => ({ binding, ...entry })),
    destroy(): void {
      // noop
    }
  } as WebGL2BindGroup;
}

//#endregion BindGroup

//#region RenderPipeline

/**
 * Creates a new render pipeline state object.
 * @param device the GPU device
 * @param desc the pipeline descriptor
 * @returns new render pipeline object
 */
export function createRenderPipeline(device: Device, desc: RenderPipelineDescriptor): RenderPipeline {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const glp = compileShaderProgram(device, (desc.vertex as WebGL2Shader).gls!, (desc.fragment as WebGL2Shader).gls!);
  const cache: UniformCache[][] = [];
  const textureSlots: Record<string, number> = {};

  // Populate uniform cache
  let bufCount = 0;
  let texCount = 0;
  if (desc.bindGroups) {
    for (let i = 0; i < desc.bindGroups.length; ++i) {
      const entries = (desc.bindGroups[i] as WebGL2BindGroupLayout).entries;
      cache.push([]);

      for (let j = 0; j < entries.length; ++j) {
        const entry = entries[j];
        let loc = null;
        let index = GLenum.INVALID_INDEX;

        if (entry.type === BindingType.Buffer) {
          index = (device as WebGL2Device).gl.getUniformBlockIndex(glp, entry.label);
          (device as WebGL2Device).gl.uniformBlockBinding(glp, index, bufCount++);
        } else if (entry.type === BindingType.Texture) {
          loc = (device as WebGL2Device).gl.getUniformLocation(glp, entry.label);
          textureSlots[entry.label] = texCount++;
        }

        cache[i][entry.binding] = {
          ...entry,
          loc,
          index,
          slot: entry.type === BindingType.Buffer ? bufCount - 1 :
            entry.type === BindingType.Texture ? texCount - 1 : 0,
        };
      }
    }

    // Sampler needs to use the matching texture slot
    for (let i = 0; i < desc.bindGroups.length; ++i) {
      const entries = (desc.bindGroups[i] as WebGL2BindGroupLayout).entries;
      for (let j = 0; j < entries.length; ++j) {
        if (entries[j].type === BindingType.Sampler) {
          if (textureSlots[entries[j].label]) {
            cache[i][entries[j].binding].slot = textureSlots[entries[j].label];
          }
        }
      }
    }
  }

  return {
    gl: (device as WebGL2Device).gl,
    glp,
    buffers: desc.buffers,
    cache,
    state: createPipelineState(desc),
    destroy(): void {
      this.gl.deleteProgram(this.glp);
    }
  } as WebGL2RenderPipeline;
}

//#endregion RenderPipeline

//#region Read/Write

/**
 * Reads data from a buffer.
 * @param device the GPU device
 * @param buffer the GPU buffer to read from
 * @param out the output CPU buffer
 * @param offset othe byte offset into GPU buffer to begin reading from. Defaults to 0
 * @returns a future
 */
export function readBuffer(device: Device, buffer: Buffer, out: Uint8Array, offset: UInt = 0): Future {
  const future = { done: false };
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  getBufferSubData((device as WebGL2Device).gl, (buffer as WebGL2Buffer).type, (buffer as WebGL2Buffer).glb!, offset, out.byteLength)
    .then(data => out.set(data))
    .finally(() => future.done = true);
  return future;
}

/**
 * Writes data to a buffer.
 * @param device the GPU device
 * @param buffer the buffer to write to
 * @param data the buffer data
 * @param offset the byte offset into GPU buffer to begin writing to. Defaults to 0
 */
export function writeBuffer(device: Device, buffer: Buffer, data: ArrayBufferView, offset: UInt = 0): void {
  (device as WebGL2Device).gl.bindBuffer((buffer as WebGL2Buffer).type, (buffer as WebGL2Buffer).glb);
  (device as WebGL2Device).gl.bufferSubData((buffer as WebGL2Buffer).type, offset, data);
}

/**
 * Copies data from a buffer to another buffer.
 * @param device the GPU device
 * @param src the buffer to read from
 * @param dst the buffer to write to
 * @param size the byte size of the GPU buffer to read. Defaults to the whole buffer
 * @param srcOffset the byte offset into src buffer to begin reading from. Defaults to 0
 * @param dstOffset the byte offset into dst buffer to begin writing to. Defaults to 0
 */
export function copyBuffer(
  device: Device, src: Buffer, dst: Buffer, size: UInt = (src as WebGL2Buffer).size, srcOffset: UInt = 0, dstOffset: UInt = 0
): void {
  (device as WebGL2Device).gl.bindBuffer(GLenum.COPY_READ_BUFFER, (src as WebGL2Buffer).glb);
  (device as WebGL2Device).gl.bindBuffer(GLenum.COPY_WRITE_BUFFER, (dst as WebGL2Buffer).glb);
  (device as WebGL2Device).gl.copyBufferSubData(GLenum.COPY_READ_BUFFER, GLenum.COPY_WRITE_BUFFER, srcOffset, dstOffset, size);
}

/**
 * Generates mipmap for a texture.
 * @param device the GPU device
 * @param texture the texture
 * @param hint mipmap quality hint
 */
export function generateMipmap(device: Device, texture: Texture, hint: MipmapHint = GLenum.DONT_CARE): void {
  (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0);
  (device as WebGL2Device).gl.bindTexture((texture as WebGL2Texture).type, (texture as WebGL2Texture).glt);
  (device as WebGL2Device).gl.hint(GLenum.GENERATE_MIPMAP_HINT, hint);
  (device as WebGL2Device).gl.generateMipmap((texture as WebGL2Texture).type);
}

/**
 * Writes subregion of data array to a texture.
 * @param device the GPU device
 * @param texture the texture subregion to write to.
 * @param data the texture data
 * @param layout the data layout
 * @param size the size of the data subregion to write
 */
export function writeTexture(
  device: Device,
  { texture, mipLevel = 0, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  data: ArrayBufferView,
  { offset = 0, bytesPerRow, rowsPerImage = 0 }: ImageDataLayout,
  [width, height, depth]: Extent3D = [(texture as WebGL2Texture).width - x, (texture as WebGL2Texture).height - y, (texture as WebGL2Texture).depth - z]
): void {
  const glFormat = glTexelFormat((texture as WebGL2Texture).format);
  const glType = glTexelType((texture as WebGL2Texture).format);
  const isCube = (texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP;
  const target = isCube ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + z : (texture as WebGL2Texture).type;

  (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0);
  (device as WebGL2Device).gl.bindTexture((texture as WebGL2Texture).type, (texture as WebGL2Texture).glt);

  const pixelSize = glTexelSize((texture as WebGL2Texture).format);
  const imageHeight = rowsPerImage || height;
  const pixelsPerRow = Math.floor(bytesPerRow / pixelSize);
  const offsetAligned = offset - offset % bytesPerRow;
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_IMAGE_HEIGHT, imageHeight);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_ROW_LENGTH, pixelsPerRow);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_PIXELS, Math.floor((offset % bytesPerRow) / pixelSize));
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_ROWS, 0);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_IMAGES, 0);

  if (is3DTexture((texture as WebGL2Texture).type)) {
    (device as WebGL2Device).gl.texSubImage3D(target, mipLevel, x, y, z, width, height, depth, (texture as WebGL2Texture).format, glType, data, offsetAligned);
  } else if (isCube) {
    for (let slice = z; slice < z + depth; ++slice) {
      (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_ROWS, slice * pixelsPerRow * imageHeight);
      (device as WebGL2Device).gl.texSubImage2D(target + slice, mipLevel, x, y, width, height, glFormat, glType, data, offsetAligned);
    }
  } else { // 2D texture
    (device as WebGL2Device).gl.texSubImage2D(target, mipLevel, x, y, width, height, glFormat, glType, data, offsetAligned);
  }
}

/**
 * Uploads an image subregion to a texture.
 * @param device the GPU device
 * @param src the image subregion to write
 * @param dst the texture subregion to write to.
 * @param size the size of image subregion to write
 */
export function copyExternalImageToTexture(
  device: Device,
  { src, origin: [srcX, srcY] = [0, 0] }: ImageCopyExternalImage,
  { texture, mipLevel = 0, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  [width, height]: Extent2D = [src.width - srcX, src.height - srcY]
): void {
  const glType = glTexelType((texture as WebGL2Texture).format);
  const isCube = (texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP;
  const target = isCube ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + z : (texture as WebGL2Texture).type;

  (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0);
  (device as WebGL2Device).gl.bindTexture((texture as WebGL2Texture).type, (texture as WebGL2Texture).glt);

  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_PIXELS, srcX);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_ROWS, srcY);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_SKIP_IMAGES, 0);
  (device as WebGL2Device).gl.pixelStorei(GLenum.UNPACK_IMAGE_HEIGHT, 0);

  if (is3DTexture((texture as WebGL2Texture).type)) {
    (device as WebGL2Device).gl.texSubImage3D(target, mipLevel, x, y, z, width, height, 1, (texture as WebGL2Texture).format, glType, src);
  } else {
    (device as WebGL2Device).gl.texSubImage2D(target, mipLevel, x, y, width, height, glTexelFormat((texture as WebGL2Texture).format), glType, src);
  }
}

/**
 * Copies subregion of a texture to another texture.
 * @param device the GPU device
 * @param src the texture subregion to read from.
 * @param dst the texture subregion to write to.
 * @param size the size of the texture subregion to copy
 */
export function copyTexture(
  device: Device,
  { texture, mipLevel = 0, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  { texture: dstTexture, mipLevel: dstMipLevel = 0, origin: [dstX, dstY, dstZ] = [0, 0, 0] }: ImageCopyTexture,
  [width, height, depth]: Extent3D = [(texture as WebGL2Texture).width - x, (texture as WebGL2Texture).height - y, (texture as WebGL2Texture).depth - z]
): void {
  // Bind dst
  const isCube = (dstTexture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP;
  const target = isCube ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + dstZ : (dstTexture as WebGL2Texture).type;
  (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0);
  (device as WebGL2Device).gl.bindTexture((dstTexture as WebGL2Texture).type, (dstTexture as WebGL2Texture).glt);

  // Bind src to framebuffer then copy to dst
  (device as WebGL2Device).gl.readBuffer(GLenum.COLOR_ATTACHMENT0);
  (device as WebGL2Device).gl.bindFramebuffer(GLenum.FRAMEBUFFER, (device as WebGL2Device).state.copyFrameBuffer);

  if (is3DTexture((texture as WebGL2Texture).type) || (texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP) {
    for (let slice = z; slice < z + depth; ++slice) {  // Copy each slice. TODO: Can be expensive for large 3D textures!
      framebufferTexture((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0, { texture, mipLevel, slice });
      if (MUGL_DEBUG) {
        console.assert(
          (device as WebGL2Device).gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || (device as WebGL2Device).gl.isContextLost(),
          'Framebuffer completeness check failed for copyTexture'
        );
      }
      if (is3DTexture((dstTexture as WebGL2Texture).type)) {
        (device as WebGL2Device).gl.copyTexSubImage3D(target + (isCube ? slice : 0), dstMipLevel, dstX, dstY, dstZ, x, y, width, height);
      } else {
        (device as WebGL2Device).gl.copyTexSubImage2D(target + (isCube ? slice : 0), dstMipLevel, dstX, dstY, x, y, width, height);
      }
    }
  } else { // src is 2D texture
    const slice = 0;
    framebufferTexture((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0, { texture, mipLevel, slice });
    if (MUGL_DEBUG) {
      console.assert(
        (device as WebGL2Device).gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || (device as WebGL2Device).gl.isContextLost(),
        'Framebuffer completeness check failed for copyTexture'
      );
    }
    if (is3DTexture((dstTexture as WebGL2Texture).type)) {
      (device as WebGL2Device).gl.copyTexSubImage3D(target + (isCube ? slice : 0), dstMipLevel, dstX, dstY, dstZ, x, y, width, height);
    } else {
      (device as WebGL2Device).gl.copyTexSubImage2D(target + (isCube ? slice : 0), dstMipLevel, dstX, dstY, x, y, width, height);
    }
  }

  // Reset to original framebuffer
  (device as WebGL2Device).gl.bindFramebuffer(
    GLenum.FRAMEBUFFER,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (device as WebGL2Device).pass ? (device as WebGL2Device).pass!.glfb : null
  );
}

/**
 * Copies subregion of a texture to a buffer.
 * @param device the GPU device
 * @param src the texture subregion to read from.
 * @param dst the buffer to write to
 * @param layout the buffer data layout to use for storing the texture
 * @param size the size of the texture subregion to copy
 */
export function copyTextureToBuffer(
  device: Device,
  { texture, mipLevel = 0, origin: [x, y, z] = [0, 0, 0] }: ImageCopyTexture,
  dst: Buffer,
  { offset = 0, bytesPerRow, rowsPerImage = 0 }: ImageDataLayout,
  [width, height, depth]: Extent3D = [(texture as WebGL2Texture).width - x, (texture as WebGL2Texture).height - y, (texture as WebGL2Texture).depth - z]
): void {
  (device as WebGL2Device).gl.bindBuffer(GLenum.PIXEL_PACK_BUFFER, dst);
  (device as WebGL2Device).gl.readBuffer(GLenum.COLOR_ATTACHMENT0);
  (device as WebGL2Device).gl.bindFramebuffer(GLenum.FRAMEBUFFER, (device as WebGL2Device).state.copyFrameBuffer);

  // TODO: validate formats. Not all formats can be read.
  // See: https://webgl2fundamentals.org/webgl/lessons/webgl-readpixels.html
  const type = glTexelType((texture as WebGL2Texture).format);
  const format = glTexelFormat((texture as WebGL2Texture).format);
  const pixelSize = glTexelSize((texture as WebGL2Texture).format);
  const imageHeight = rowsPerImage || height;
  const pixelsPerRow = Math.floor(bytesPerRow / pixelSize);
  const offsetAligned = offset - offset % bytesPerRow;
  (device as WebGL2Device).gl.pixelStorei(GLenum.PACK_ROW_LENGTH, pixelsPerRow);
  (device as WebGL2Device).gl.pixelStorei(GLenum.PACK_SKIP_PIXELS, Math.floor((offset % bytesPerRow) / pixelSize));
  (device as WebGL2Device).gl.pixelStorei(GLenum.PACK_SKIP_ROWS, 0);

  if (is3DTexture((texture as WebGL2Texture).type) || (texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP) {
    for (let slice = z; slice < z + depth; ++slice) {  // Copy each slice. TODO: Can be expensive for large 3D textures!
      framebufferTexture((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0, { texture, mipLevel, slice });
      if (MUGL_DEBUG) {
        console.assert(
          (device as WebGL2Device).gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || (device as WebGL2Device).gl.isContextLost(),
          'Framebuffer completeness check failed for copyTexture'
        );
      }
      (device as WebGL2Device).gl.readPixels(x, y, width, height, format, type, offsetAligned + (slice - z) * bytesPerRow * imageHeight);
    }
  } else { // src is 2D texture
    const slice = 0;
    framebufferTexture((device as WebGL2Device).gl, GLenum.COLOR_ATTACHMENT0, { texture, mipLevel, slice });
    if (MUGL_DEBUG) {
      console.assert(
        (device as WebGL2Device).gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || (device as WebGL2Device).gl.isContextLost(),
        'Framebuffer completeness check failed for copyTexture'
      );
    }
    (device as WebGL2Device).gl.readPixels(x, y, width, height, format, type, offsetAligned);
  }

  // Reset to original framebuffer
  (device as WebGL2Device).gl.bindFramebuffer(
    GLenum.FRAMEBUFFER,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (device as WebGL2Device).pass ? (device as WebGL2Device).pass!.glfb : null
  );
}

//#endregion Read/Write

//#region Render

/**
 * Starts a render pass.
 * @param device the GPU device
 * @param pass the render pass
 */
export function beginRenderPass(device: Device, pass: RenderPass): void {
  let width = (device as WebGL2Device).gl.drawingBufferWidth;
  let height = (device as WebGL2Device).gl.drawingBufferHeight;
  if ((pass as WebGL2RenderPass).color.length) { // Offscreen pass
    width = (pass as WebGL2RenderPass).color[0].width;
    height = (pass as WebGL2RenderPass).color[0].height;
  }

  // Bind the pass framebuffer
  (device as WebGL2Device).gl.bindFramebuffer(GLenum.FRAMEBUFFER, (pass as WebGL2RenderPass).glfb);

  // Reset viewport and scissor. Necessary for buffer clearing
  (device as WebGL2Device).gl.viewport(0, 0, width, height);
  (device as WebGL2Device).gl.depthRange(0, 1);
  if ((device as WebGL2Device).state.scissor) {
    (device as WebGL2Device).state.scissor = false;
    glToggle((device as WebGL2Device).gl, GLenum.SCISSOR_TEST, false);
  }

  // Clear color/depth/stencil, override masks as necessary to allow clearing
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  let clearMask = 0;
  if (!isNaN((pass as WebGL2RenderPass).clearDepth!)) {
    clearMask |= GLenum.DEPTH_BUFFER_BIT;
    (device as WebGL2Device).gl.clearDepth((pass as WebGL2RenderPass).clearDepth!);
    applyDepthMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.depthWrite, true);
    (device as WebGL2Device).state.state.depthWrite = true;
  }
  if (!isNaN((pass as WebGL2RenderPass).clearStencil!)) {
    clearMask |= GLenum.STENCIL_BUFFER_BIT;
    (device as WebGL2Device).gl.clearStencil((pass as WebGL2RenderPass).clearStencil!);
    applyStencilMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.stencilWriteMask, BYTE_MASK);
    (device as WebGL2Device).state.state.stencilWriteMask = BYTE_MASK;
  }
  applyColorMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.blendWriteMask, ColorWrite.All);
  (device as WebGL2Device).state.state.blendWriteMask = ColorWrite.All;

  if ((pass as WebGL2RenderPass).color.length) { // Offscreen pass
    for (let i = 0; i < (pass as WebGL2RenderPass).color.length; ++i) {
      if ((pass as WebGL2RenderPass).clearColors[i]) {
        const type = glClearType((pass as WebGL2RenderPass).color[i].format);
        if (type === GLenum.INT) {
          (device as WebGL2Device).gl.clearBufferiv(GLenum.COLOR, i, (pass as WebGL2RenderPass).clearColors[i]!);
        } else if (type === GLenum.UNSIGNED_INT) {
          (device as WebGL2Device).gl.clearBufferuiv(GLenum.COLOR, i, (pass as WebGL2RenderPass).clearColors[i]!);
        } else { // type === GLenum.FLOAT
          (device as WebGL2Device).gl.clearBufferfv(GLenum.COLOR, i, (pass as WebGL2RenderPass).clearColors[i]!);
        }
      }
    }
  } else if ((pass as WebGL2RenderPass).clearColor) { // for default pass
    clearMask |= GLenum.COLOR_BUFFER_BIT;
    (device as WebGL2Device).gl.clearColor(...(pass as WebGL2RenderPass).clearColor!);
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  if (clearMask) {
    (device as WebGL2Device).gl.clear(clearMask);
  }

  (device as WebGL2Device).pass = pass as WebGL2RenderPass;
}

/**
 * Convenient method to start a default render pass.
 * @param device the GPU device
 * @param desc the render pass descriptor
 */
export function beginDefaultPass(device: Device, desc: DefaultRenderPassDescriptor = {}): void {
  // Unbind any framebuffer
  (device as WebGL2Device).gl.bindFramebuffer(GLenum.FRAMEBUFFER, null);

  // Reset viewport and scissor. Necessary for buffer clearing
  (device as WebGL2Device).gl.viewport(0, 0, (device as WebGL2Device).gl.drawingBufferWidth, (device as WebGL2Device).gl.drawingBufferHeight);
  (device as WebGL2Device).gl.depthRange(0, 1);
  if ((device as WebGL2Device).state.scissor) {
    (device as WebGL2Device).state.scissor = false;
    glToggle((device as WebGL2Device).gl, GLenum.SCISSOR_TEST, false);
  }

  // Clear color/depth/stencil, override masks as necessary to allow clearing
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  let clearMask = 0;
  if (!isNaN(desc.clearDepth!)) {
    clearMask |= GLenum.DEPTH_BUFFER_BIT;
    (device as WebGL2Device).gl.clearDepth(desc.clearDepth!);
    applyDepthMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.depthWrite, true);
    (device as WebGL2Device).state.state.depthWrite = true;
  }
  if (!isNaN(desc.clearStencil!)) {
    clearMask |= GLenum.STENCIL_BUFFER_BIT;
    (device as WebGL2Device).gl.clearStencil(desc.clearStencil!);
    applyStencilMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.stencilWriteMask, BYTE_MASK);
    (device as WebGL2Device).state.state.stencilWriteMask = BYTE_MASK;
  }
  if (desc.clearColor) {
    clearMask |= GLenum.COLOR_BUFFER_BIT;
    (device as WebGL2Device).gl.clearColor(...desc.clearColor!);
    applyColorMask((device as WebGL2Device).gl, (device as WebGL2Device).state.state.blendWriteMask, ColorWrite.All);
    (device as WebGL2Device).state.state.blendWriteMask = ColorWrite.All;
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  if (clearMask) {
    (device as WebGL2Device).gl.clear(clearMask);
  }

  (device as WebGL2Device).pass = null;
}

/**
 * Submits the current render pass.
 * @param device the GPU device
 */
export function submitRenderPass(device: Device): void {
  if ((device as WebGL2Device).pass) {
    // Blit main framebuffer content to MSAA resolve framebuffers so that texture contents are updated
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    for (let i = 0; i < (device as WebGL2Device).pass!.color.length; ++i) {
      if ((device as WebGL2Device).pass!.glrfb[i]) {
        blitFramebuffer((device as WebGL2Device).gl, (device as WebGL2Device).pass!.glfb, (device as WebGL2Device).pass!.glrfb[i],
          (device as WebGL2Device).pass!.color[i], GLenum.COLOR_BUFFER_BIT, GLenum.COLOR_ATTACHMENT0 + i);
      }
    }
    const depthFb = (device as WebGL2Device).pass!.glrfb[(device as WebGL2Device).pass!.glrfb.length - 1];
    if ((device as WebGL2Device).pass!.depth && depthFb) {
      blitFramebuffer((device as WebGL2Device).gl, (device as WebGL2Device).pass!.glfb, depthFb,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (device as WebGL2Device).pass!.depth!, GLenum.DEPTH_BUFFER_BIT | GLenum.STENCIL_BUFFER_BIT);
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }
  (device as WebGL2Device).pass = null;
}

/**
 * Binds a RenderPipeline to the current render pass.
 * @param device the GPU device
 * @param pipeline the pipeline to bind
 */
export function setRenderPipeline(device: Device, pipeline: RenderPipeline): void {
  // Optimization: pipeline unchanged, skip other updates
  if ((device as WebGL2Device).state.pipeline === pipeline) {
    return;
  }

  // Update shader program
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!(device as WebGL2Device).state.pipeline || (device as WebGL2Device).state.pipeline!.glp !== (pipeline as WebGL2RenderPipeline).glp) {
    (device as WebGL2Device).gl.useProgram((pipeline as WebGL2RenderPipeline).glp);
  }

  // Update pipeline state cache
  applyPipelineState((device as WebGL2Device).gl, (device as WebGL2Device).state.state, (pipeline as WebGL2RenderPipeline).state, (device as WebGL2Device).state.stencilRef);
  Object.assign((device as WebGL2Device).state.state, (pipeline as WebGL2RenderPipeline).state);

  // Update buffer attributes cache
  const attribEnabled: UInt[] = []; // Attribute enabled state bit flags (1 = originally enabled, 2 = should be enabled)
  for (const { attributes } of (device as WebGL2Device).state.buffers) {
    for (const { ptr } of attributes) {
      attribEnabled[ptr[0]] = 1; // 1 = originally enabled, should disable if not used
    }
  }
  (device as WebGL2Device).state.buffers = Array((pipeline as WebGL2RenderPipeline).buffers.length);
  for (let slot = 0; slot < (pipeline as WebGL2RenderPipeline).buffers.length; ++slot) {
    const { attributes, stride, stepMode = 0 } = (pipeline as WebGL2RenderPipeline).buffers[slot];
    const bufAttrs: WebGL2Attribute[] = [];
    (device as WebGL2Device).state.buffers[slot] = {
      glb: null, attributes: bufAttrs, stride, step: stepMode, offset: 0, instanceOffset: 0
    };
    for (const { format, offset, shaderLocation } of attributes) {
      attribEnabled[shaderLocation] = (attribEnabled[shaderLocation] || 0) + 2; // 2 = should be enabled
      bufAttrs.push({
        buffer: slot,
        ptr: [
          shaderLocation,
          vertexSize(format),
          vertexType(format),
          vertexNormalized(format),
          stride,
          offset
        ],
        step: stepMode
      });
    }
  }

  // Enable / disable vertex attributes
  // attribEnabled: 0 = unused, 1 = originally enabled, now should disable, 2 = originally disabled, should enable, 3 = keep enabled
  for (let i = 0; i < attribEnabled.length; ++i) {
    if (attribEnabled[i] === 2) {
      (device as WebGL2Device).gl.enableVertexAttribArray(i);
    } else if (attribEnabled[i] === 1) {
      (device as WebGL2Device).gl.disableVertexAttribArray(i);
    }
  }

  // Set pipeline as current
  (device as WebGL2Device).state.pipeline = pipeline as WebGL2RenderPipeline;
}

/**
 * Binds an index buffer to the current render pass.
 * @param device the GPU device
 * @param buffer the buffer to bind
 */
export function setIndex(device: Device, buffer: Buffer): void {
  if ((buffer as WebGL2Buffer).glb !== (device as WebGL2Device).state.index) {
    (device as WebGL2Device).gl.bindBuffer(GLenum.ELEMENT_ARRAY_BUFFER, ((device as WebGL2Device).state.index = (buffer as WebGL2Buffer).glb));
  }
}

/**
 * Binds a vertex buffer to a slot in the current render pass.
 * @param device the GPU device
 * @param slot the vertex slot to bind to
 * @param buffer the buffer to bind
 */
export function setVertex(device: Device, slot: number, buffer: Buffer, offset: UInt = 0): void {
  const buf = (device as WebGL2Device).state.buffers[slot];
  if (buf && (buf.glb !== (buffer as WebGL2Buffer).glb || buf.offset !== offset)) {
    buf.glb = (buffer as WebGL2Buffer).glb;
    buf.offset = offset;
    buf.instanceOffset = 0;
    vertexAttribs((device as WebGL2Device).gl, buf, offset);
  }
}

/**
 * Binds a bind group to the current render pass.
 * @param device the GPU device
 * @param slot the bind group slot to bind to
 * @param bindGorup the bind group to use
 * @param offsets the dynamic offsets for dynamic buffers in this bind group
 */
export function setBindGroup(device: Device, slot: UInt, bindGroup: BindGroup, offsets: UIntArray = []): void {
  if (!(device as WebGL2Device).state.pipeline) {
    return; // Skipping updates. No effect if pipeline not bound
  }

  for (let i = 0, offsetIdx = 0; i < (bindGroup as WebGL2BindGroup).entries.length; ++i) {
    const uniform = (bindGroup as WebGL2BindGroup).entries[i];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uniformInfo = (device as WebGL2Device).state.pipeline!.cache[slot] && (device as WebGL2Device).state.pipeline!.cache[slot][uniform.binding];
    if (!uniformInfo) { // No such uniform
      if (MUGL_DEBUG) {
        console.warn(`Undefined uniform binding: ${uniform.binding}, slot: ${slot}`);
      }
      continue;
    }

    if (MUGL_DEBUG) {
      if (uniform.buffer) {
        console.assert(uniformInfo.type === BindingType.Buffer,
          `Cannot bind buffer to uniform: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}`);

        console.assert((uniform.buffer as WebGL2Buffer).type === GLenum.UNIFORM_BUFFER,
          `Invalid buffer type bound to uniform buffer: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}`);

        const dataSize = (device as WebGL2Device).gl.getActiveUniformBlockParameter(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (device as WebGL2Device).state.pipeline!.glp!,
          uniformInfo.index,
          GLenum.UNIFORM_BLOCK_DATA_SIZE
        );
        const alignment = (device as WebGL2Device).gl.getParameter(GLenum.UNIFORM_BUFFER_OFFSET_ALIGNMENT);
        console.assert((uniform.buffer as WebGL2Buffer).size >= dataSize,
          `Uniform buffer not large enough: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}, UNIFORM_BLOCK_DATA_SIZE: ${dataSize}, UNIFORM_BUFFER_OFFSET_ALIGNMENT: ${alignment}, size: ${(uniform.buffer as WebGL2Buffer).size}`);
      } else if (uniform.texture) {
        console.assert(uniformInfo.type === BindingType.Texture,
          `Cannot bind texture to uniform: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}`);
      } else if (uniform.sampler) {
        console.assert(uniformInfo.type === BindingType.Sampler,
          `Cannot bind sampler to uniform: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}`);
      } else {
        console.assert(false, `Either a buffer, texture, or sampler must be specified: ${uniformInfo.label}, binding: ${uniformInfo.binding}, slot: ${slot}`);
      }
    }

    if (uniform.buffer) {
      let offset = uniform.bufferOffset || 0;
      if (uniformInfo.bufferDynamicOffset) {
        offset += offsets[offsetIdx] || 0;
        ++offsetIdx;
      }

      (device as WebGL2Device).gl.bindBufferRange(
        GLenum.UNIFORM_BUFFER,
        uniformInfo.slot,
        (uniform.buffer as WebGL2Buffer).glb,
        offset,
        uniform.bufferSize || ((uniform.buffer as WebGL2Buffer).size - offset)
      );
    } else if (uniform.texture) {
      (device as WebGL2Device).gl.activeTexture(GLenum.TEXTURE0 + uniformInfo.slot);
      (device as WebGL2Device).gl.bindTexture((uniform.texture as WebGL2Texture).type, (uniform.texture as WebGL2Texture).glt);
      (device as WebGL2Device).gl.uniform1i(uniformInfo.loc, uniformInfo.slot);
    } else if (uniform.sampler) {
      (device as WebGL2Device).gl.bindSampler(uniformInfo.slot, (uniform.sampler as WebGL2Sampler).gls);
    }
  }
}

/**
 * Submits a draw call in the current render pass.
 * @param device the GPU device
 * @param vertexCount the number of vertices to draw
 * @param instanceCount the number of instances to draw. Defaults to 1
 * @param firstVertex the offset to the first vertex to draw. Defaults to 0
 * @param firstInstance the offset to the first instance to draw. Defaults to 0
 */
export function draw(device: Device, vertexCount: number, instanceCount = 1, firstVertex = 0, firstInstance: UInt = 0): void {
  for (const buf of (device as WebGL2Device).state.buffers) {
    if (buf.step && buf.instanceOffset !== firstInstance) {
      buf.instanceOffset = firstInstance;
      vertexAttribs((device as WebGL2Device).gl, buf, firstInstance * buf.stride);
    }
  }
  (device as WebGL2Device).gl.drawArraysInstanced((device as WebGL2Device).state.state.topology, firstVertex, vertexCount, instanceCount);
}

/**
 * Submits an indexed draw call in the current render pass.
 * @param device the GPU device
 * @param indexCount the number of vertices to draw
 * @param instanceCount the number of instances to draw. Defaults to 1
 * @param firstVertex the offset to the first vertex to draw. Defaults to 0
 * @param firstInstance the offset to the first instance to draw. Defaults to 0
 */
export function drawIndexed(device: Device, indexCount: number, instanceCount = 1, firstIndex = 0, firstInstance: UInt = 0): void {
  for (const buf of (device as WebGL2Device).state.buffers) {
    if (buf.step && buf.instanceOffset !== firstInstance) {
      buf.instanceOffset = firstInstance;
      vertexAttribs((device as WebGL2Device).gl, buf, firstInstance * buf.stride);
    }
  }
  (device as WebGL2Device).gl.drawElementsInstanced(
    (device as WebGL2Device).state.state.topology, indexCount, (device as WebGL2Device).state.state.indexFormat,
    firstIndex * indexByteSize((device as WebGL2Device).state.state.indexFormat), instanceCount
  );
}

/**
 * Sets the 3D viewport area for the current render pass.
 * @param device the GPU device
 * @param x x offset
 * @param y y offset
 * @param width width
 * @param height height
 * @param minDepth min depth. Defaults to 0
 * @param maxDepth max depth. Defaults to 1
 */
export function setViewport(device: Device, x: number, y: number, width: number, height: number, minDepth = 0, maxDepth = 1): void {
  (device as WebGL2Device).gl.viewport(x, y, width, height);
  (device as WebGL2Device).gl.depthRange(minDepth, maxDepth);
}

/**
 * Sets the scissor rectangle for the current render pass.
 * @param device the GPU device
 * @param x x offset
 * @param y y offset
 * @param width width
 * @param height height
 */
export function setScissorRect(device: Device, x: number, y: number, width: number, height: number): void {
  if (!(device as WebGL2Device).state.scissor) {
    glToggle((device as WebGL2Device).gl, GLenum.SCISSOR_TEST, true);
    (device as WebGL2Device).state.scissor = true;
  }
  (device as WebGL2Device).gl.scissor(x, y, width, height);
}

/**
 * Sets the blend-constant color for the current render pass.
 * @param device the GPU device
 * @param color the blend color
 */
export function setBlendConst(device: Device, color: Color): void {
  (device as WebGL2Device).gl.blendColor(...color);
}

/**
 * Sets the stencil reference value for the current render pass.
 * @param device the GPU device
 * @param ref the stencil reference value.
 */
export function setStencilRef(device: Device, ref: UInt): void {
  if ((device as WebGL2Device).state.stencilRef !== ref) {
    const { stencilFrontCompare, stencilBackCompare, stencilReadMask } = (device as WebGL2Device).state.state;
    (device as WebGL2Device).gl.stencilFuncSeparate(GLenum.FRONT, stencilFrontCompare, ref, stencilReadMask);
    (device as WebGL2Device).gl.stencilFuncSeparate(GLenum.BACK, stencilBackCompare, ref, stencilReadMask);
    (device as WebGL2Device).state.stencilRef = ref;
  }
}

//#endregion Render

//#region Internal Types

interface WebGL2State {
  copyFrameBuffer: WebGLFramebuffer | null,
  buffers: WebGL2BufferAttributes[],
  state: WebGL2PipelineState;
  pipeline: WebGL2RenderPipeline | null;
  index: WebGLBuffer | null;
  stencilRef: UInt;
  scissor: boolean;
}

interface WebGL2Attribute {
  buffer: UInt;
  ptr: [
    loc: UInt,
    size: UInt,
    type: UInt,
    normalized: boolean,
    stride: UInt,
    offset: UInt
  ];
  step: UInt;
}

interface WebGL2BufferAttributes {
  glb: WebGLBuffer | null;
  attributes: WebGL2Attribute[];
  stride: UInt;
  step: UInt;
  offset: UInt;
  instanceOffset: UInt;
}

interface WebGL2PipelineState {
  topology: UInt;
  indexFormat: UInt;
  frontFace: UInt;
  cullMode: UInt;

  sampleCount: UInt;
  alphaToCoverage: boolean;

  depth: boolean;
  depthWrite: boolean;
  depthFormat: UInt;
  depthCompare: UInt;
  depthBias: Float;
  depthBiasSlopeScale: Float;

  stencil: boolean;
  stencilFrontCompare: UInt;
  stencilFrontFailOp: UInt;
  stencilFrontDepthFailOp: UInt;
  stencilFrontPassOp: UInt;
  stencilBackCompare: UInt;
  stencilBackFailOp: UInt;
  stencilBackDepthFailOp: UInt;
  stencilBackPassOp: UInt;
  stencilReadMask: UInt;
  stencilWriteMask: UInt;

  blend: boolean;
  blendWriteMask: UInt;
  blendColorOp: UInt;
  blendColorSrcFactor: UInt;
  blendColorDstFactor: UInt;
  blendAlphaOp: UInt;
  blendAlphaSrcFactor: UInt;
  blendAlphaDstFactor: UInt;
}

/** An entry of uniform info cache */
interface UniformCache {
  /** Bind group entry name. */
  label: string;
  /** Binding location. */
  binding: UInt;
  /** The type of binding. */
  type: BindingType;
  /** Uniform location. */
  loc: WebGLUniformLocation | null
  /** Uniform block index. */
  index: GLuint;
  /** Uniform buffer / Texture bind slot ID. */
  slot: number;
  /** Dynamic offset uniform buffer. */
  bufferDynamicOffset?: boolean;
}

//#endregion Internal Types

//#region Helpers

function initWebGL2State(gl: WebGL2RenderingContext): WebGL2State {
  const state = createPipelineState();

  // Apply the default states
  gl.blendColor(1, 1, 1, 1);
  applyPipelineState(gl, state, state, 0, true);
  for (let i = 0; i < MAX_VERTEX_ATTRIBS; ++i) {
    gl.disableVertexAttribArray(i);
  }

  // Default alignment is 4. Use 1 to make byte data texture work.
  gl.pixelStorei(GLenum.PACK_ALIGNMENT, 1);
  gl.pixelStorei(GLenum.UNPACK_ALIGNMENT, 1);

  return {
    copyFrameBuffer: gl.createFramebuffer(),
    buffers: [],
    state,
    pipeline: null,
    index: null,
    stencilRef: 0,
    scissor: false
  };
}

function compileShaderProgram(device: Device, vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const glp = (device as WebGL2Device).gl.createProgram()!;
  (device as WebGL2Device).gl.attachShader(glp, vertex);
  (device as WebGL2Device).gl.attachShader(glp, fragment);
  (device as WebGL2Device).gl.linkProgram(glp);

  if (MUGL_DEBUG) {
    console.assert(
      (device as WebGL2Device).gl.getProgramParameter(glp, GLenum.LINK_STATUS) || isDeviceLost(device),
      `Failed to link program: ${(device as WebGL2Device).gl.getProgramInfoLog(glp)}`
    );
  }

  return glp;
}

function framebufferTexture(
  gl: WebGL2RenderingContext, attachment: GLenum, { texture, slice = 0, mipLevel = 0 }: TextureView
): void {
  if (is3DTexture((texture as WebGL2Texture).type)) {
    gl.framebufferTextureLayer(GLenum.FRAMEBUFFER, attachment, (texture as WebGL2Texture).glt, mipLevel, slice);
  } else {
    const texTarget = ((texture as WebGL2Texture).type === GLenum.TEXTURE_CUBE_MAP) ?
      GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + slice : (texture as WebGL2Texture).type;
    gl.framebufferTexture2D(GLenum.FRAMEBUFFER, attachment, texTarget, (texture as WebGL2Texture).glt, mipLevel);
  }
}

function createResolveFrameBuffer(
  gl: WebGL2RenderingContext, attachment: GLenum, view: TextureView
): WebGLFramebuffer | null {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(GLenum.FRAMEBUFFER, fb);
  framebufferTexture(gl, attachment, view);
  if (MUGL_DEBUG) {
    console.assert(
      gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || gl.isContextLost(),
      'Framebuffer completeness check failed for MSAA resolve buffer'
    );
  }
  return fb;
}

function blitFramebuffer(
  gl: WebGL2RenderingContext, from: WebGLFramebuffer | null, to: WebGLFramebuffer | null,
  tex: WebGL2Texture, mask: number, attachment: UInt = GLenum.COLOR_ATTACHMENT0
): void {
  gl.bindFramebuffer(GLenum.READ_FRAMEBUFFER, from);
  gl.bindFramebuffer(GLenum.DRAW_FRAMEBUFFER, to);
  gl.readBuffer(attachment);
  gl.blitFramebuffer(
    0, 0, tex.width, tex.height,
    0, 0, tex.width, tex.height,
    mask, GLenum.NEAREST
  );
}

function createPipelineState(desc: RenderPipelineState = {}): WebGL2PipelineState {
  const primitive = desc.primitive || {};
  const depthStencil = desc.depthStencil || {};
  const { stencilFront = {}, stencilBack = {} } = depthStencil;
  const { sampleCount = 1, alphaToCoverage = false } = desc.multisample || {};
  const targets = desc.targets || {};
  let blendWriteMask = targets.writeMask || ColorWrite.All;
  let blendColor = targets.blendColor || {};
  let blendAlpha = targets.blendColor || {};
  if (targets.targets && targets.targets[0]) {
    blendWriteMask = targets.targets[0].writeMask || blendWriteMask;
    blendColor = targets.targets[0].blendColor || blendColor;
    blendAlpha = targets.targets[0].blendAlpha || blendAlpha;
  }

  return {
    sampleCount,
    alphaToCoverage,

    topology: primitive.topology || GLenum.TRIANGLES,
    indexFormat: primitive.indexFormat || GLenum.UNSIGNED_SHORT,
    frontFace: primitive.frontFace || GLenum.CCW,
    cullMode: primitive.cullMode || GLenum.NONE,

    depth: !!desc.depthStencil,
    depthWrite: depthStencil.depthWrite || false,
    depthFormat: depthStencil.format || GLenum.DEPTH_COMPONENT16,
    depthCompare: depthStencil.depthCompare || GLenum.ALWAYS,
    depthBias: depthStencil.depthBias || 0,
    depthBiasSlopeScale: depthStencil.depthBiasSlopeScale || 0,

    stencil: !!(depthStencil.stencilFront || depthStencil.stencilBack),
    stencilFrontCompare: stencilFront.compare || GLenum.ALWAYS,
    stencilFrontFailOp: stencilFront.failOp || GLenum.KEEP,
    stencilFrontDepthFailOp: stencilFront.depthFailOp || GLenum.KEEP,
    stencilFrontPassOp: stencilFront.passOp || GLenum.KEEP,
    stencilBackCompare: stencilBack.compare || GLenum.ALWAYS,
    stencilBackFailOp: stencilBack.failOp || GLenum.KEEP,
    stencilBackDepthFailOp: stencilBack.depthFailOp || GLenum.KEEP,
    stencilBackPassOp: stencilBack.passOp || GLenum.KEEP,
    stencilReadMask: depthStencil.stencilReadMask || STENCIL_MASK,
    stencilWriteMask: depthStencil.stencilWriteMask || STENCIL_MASK,

    blend: !!desc.targets,
    blendWriteMask,
    blendColorOp: blendColor.operation || GLenum.FUNC_ADD,
    blendColorSrcFactor: blendColor.srcFactor || GLenum.ONE,
    blendColorDstFactor: blendColor.dstFactor || GLenum.ZERO,
    blendAlphaOp: blendAlpha.operation || GLenum.FUNC_ADD,
    blendAlphaSrcFactor: blendAlpha.srcFactor || GLenum.ONE,
    blendAlphaDstFactor: blendAlpha.dstFactor || GLenum.ZERO,
  };
}

function applyPipelineState(
  gl: WebGL2RenderingContext, prevState: WebGL2PipelineState, state: WebGL2PipelineState, stencilRef = 0,
  force = false
): void {
  // Temporary variables to reuse for performance
  let b = false, n = 0, n2 = 0, n3 = 0, n4 = 0;

  // 1. Apply primitive state
  n = state.frontFace;
  if (force || (prevState.frontFace !== n)) {
    gl.frontFace(n);
  }
  n = state.cullMode;
  if (force || (prevState.cullMode !== n)) {
    if ((b = (n !== GLenum.NONE))) {
      gl.cullFace(n);
    }
    glToggle(gl, GLenum.CULL_FACE, b);
  }

  // 2. Apply multisample state
  b = state.alphaToCoverage;
  if (force || (prevState.alphaToCoverage !== b)) {
    glToggle(gl, GLenum.SAMPLE_ALPHA_TO_COVERAGE, b);
  }

  // 3. Apply depth state changes
  b = !!state.depth;
  if (force || (prevState.depth !== b)) {
    glToggle(gl, GLenum.DEPTH_TEST, b);
  }

  if (force || b) {
    applyDepthMask(gl, prevState.depthWrite, state.depthWrite, force);

    n = state.depthCompare;
    if (force || (prevState.depthCompare !== n)) {
      gl.depthFunc(n);
    }
  }

  n = state.depthBiasSlopeScale;
  n2 = state.depthBias;
  if (force || (prevState.depthBiasSlopeScale !== n) || (prevState.depthBias !== n2)) {
    glToggle(gl, GLenum.POLYGON_OFFSET_FILL, !(!n && !n2)); // Enable if any of the 2 values is non-zero
    gl.polygonOffset(n, n2);
  }

  // 4. Apply stencil state changes
  b = !!state.stencil;
  if (force || (prevState.stencil !== b)) {
    glToggle(gl, GLenum.STENCIL_TEST, b);
  }

  if (force || b) {
    n = state.stencilReadMask;
    b = force || (prevState.stencilReadMask !== n);

    n2 = state.stencilFrontCompare;
    if (b || (prevState.stencilFrontCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.FRONT, n2, stencilRef, n);
    }
    n2 = state.stencilBackCompare;
    if (b || (prevState.stencilBackCompare !== n2)) {
      gl.stencilFuncSeparate(GLenum.BACK, n2, stencilRef, n);
    }

    n = state.stencilFrontFailOp;
    n2 = state.stencilFrontDepthFailOp;
    n3 = state.stencilFrontPassOp;
    if (force ||
      (prevState.stencilFrontFailOp !== n) ||
      (prevState.stencilFrontDepthFailOp !== n2) ||
      (prevState.stencilFrontPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.FRONT, n, n2, n3);
    }
    n = state.stencilBackFailOp;
    n2 = state.stencilBackDepthFailOp;
    n3 = state.stencilBackPassOp;
    if (force ||
      (prevState.stencilBackFailOp !== n) ||
      (prevState.stencilBackDepthFailOp !== n2) ||
      (prevState.stencilBackPassOp !== n3)
    ) {
      gl.stencilOpSeparate(GLenum.BACK, n, n2, n3);
    }

    applyStencilMask(gl, prevState.stencilWriteMask, state.stencilWriteMask, force);
  }

  // 5. Apply blend state changes
  b = state.blend;
  if (force || (prevState.blend !== b)) {
    glToggle(gl, GLenum.BLEND, b);
  }

  if (force || b) {
    n = state.blendColorSrcFactor;
    n2 = state.blendColorDstFactor;
    n3 = state.blendAlphaSrcFactor;
    n4 = state.blendAlphaDstFactor;
    if (force ||
      (prevState.blendColorSrcFactor !== n) ||
      (prevState.blendColorDstFactor !== n2) ||
      (prevState.blendAlphaSrcFactor !== n3) ||
      (prevState.blendAlphaDstFactor !== n4)
    ) {
      gl.blendFuncSeparate(n, n2, n3, n4);
    }

    n = state.blendColorOp;
    n2 = state.blendAlphaOp;
    if (force || (prevState.blendColorOp !== n) || (prevState.blendAlphaOp !== n2)) {
      gl.blendEquationSeparate(n, n2);
    }

    applyColorMask(gl, prevState.blendWriteMask, state.blendWriteMask, force);
  }
}

function applyColorMask(gl: WebGL2RenderingContext, prevMask: ColorWrite, mask: ColorWrite, force = false): void {
  if (force || prevMask !== mask) {
    gl.colorMask(
      !!(mask & ColorWrite.Red),
      !!(mask & ColorWrite.Green),
      !!(mask & ColorWrite.Blue),
      !!(mask & ColorWrite.Alpha)
    );
  }
}

function applyDepthMask(gl: WebGL2RenderingContext, prevMask: boolean, mask: boolean, force = false): void {
  if (force || prevMask !== mask) {
    gl.depthMask(mask);
  }
}

function applyStencilMask(gl: WebGL2RenderingContext, prevMask: UInt, mask: UInt, force = false): void {
  if (force || prevMask !== mask) {
    gl.stencilMask(mask);
  }
}

function glToggle(gl: WebGL2RenderingContext, flag: GLenum, enable: boolean): void {
  enable ? gl.enable(flag) : gl.disable(flag);
}

function vertexAttribs(gl: WebGL2RenderingContext, buffer: WebGL2BufferAttributes, offset: UInt): void {
  gl.bindBuffer(GLenum.ARRAY_BUFFER, buffer.glb);
  for (let i = 0; i < buffer.attributes.length; ++i) {
    const { ptr, step } = buffer.attributes[i];
    const params: [number, number, number, boolean, number, number] = [...ptr];
    params[5] += offset;
    gl.vertexAttribPointer(...params);
    gl.vertexAttribDivisor(ptr[0], step);
  }
}

function clientWaitAsync(gl: WebGL2RenderingContext, sync: WebGLSync, flags: UInt, interval: UInt): Promise<void> {
  return new Promise((resolve, reject) => {
    function test() {
      const res = gl.clientWaitSync(sync, flags, 0);
      if (res == GLenum.WAIT_FAILED) {
        reject();
      } else if (res == GLenum.TIMEOUT_EXPIRED) {
        setTimeout(test, interval);
      } else {
        resolve();
      }
    }
    test();
  });
}

function getBufferSubData(gl: WebGL2RenderingContext, target: UInt, buffer: WebGLBuffer, srcOffset: UInt, length: UInt): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
  gl.flush();

  return clientWaitAsync(gl, sync, 0, 10)
    .finally(() => gl.deleteSync(sync))
    .then(() => {
      const data = new Uint8Array(length);
      gl.bindBuffer(target, buffer);
      gl.getBufferSubData(target, srcOffset, data, 0, length);
      return data;
    });
}

//#endregion Helpers
