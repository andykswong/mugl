import {
  glTexInternalFormat, glTexFormat, glTexType, isDepthStencil, is3DTexture, FilterMode, Float, GLenum,
  MinFilterMode, MipmapHint, PixelFormat, SamplerProperties, ReadonlyExtent3D, ReadonlyOrigin3D, SamplerDescriptor,
  TextureData, TextureDescriptor, TexType, TextureProperties, Uint
} from '../../common';
import { AddressMode, GLRenderingDevice, GLTexture as IGLTexture, ImageSource, ReadonlyExtent2D, ReadonlyOrigin2D } from '../device';

export class GLTexture implements IGLTexture {
  public readonly props: TextureProperties;
  public readonly sampler: SamplerProperties;
  public glt: WebGLTexture | null = null;
  public glrb: WebGLRenderbuffer | null = null;

  private readonly gl: WebGLRenderingContext;

  public constructor(
    context: GLRenderingDevice, 
    props: TextureDescriptor = {},
    sampler: SamplerDescriptor = {},
    private readonly webgl2: boolean = false
  ) {
    const gl = this.gl = context.gl;
    const type = props.type || TexType.Tex2D;
    const format = props.format || PixelFormat.RGBA8;
    const isCube = type === TexType.Cube;
    const renderTarget = isDepthStencil(format) && (props.renderTarget || false);
    const glInternalFormat = glTexInternalFormat(format, webgl2);

    this.props = {
      type,
      format,
      width: props.width || 1,
      height: props.height || 1,
      depth: isCube ? 6 : (props.depth || 1),
      mipLevels: props.mipLevels || 1,
      samples: webgl2 ? (props.samples || 1) : 1,
      renderTarget
    };
    this.sampler = {
      wrapU: sampler.wrapU || AddressMode.Clamp,
      wrapV: sampler.wrapV || AddressMode.Clamp,
      wrapW: sampler.wrapW || AddressMode.Clamp,
      magFilter: sampler.magFilter || FilterMode.Nearest,
      minFilter: sampler.minFilter || MinFilterMode.Nearest,
      maxLOD: sampler.maxLOD ?? 1000,
      minLOD: sampler.minLOD ?? -1000,
      maxAniso: sampler.maxAniso || 1
    }; 

    if (renderTarget || this.props.samples > 1) { // Depth-stencil / MSAA renderbuffer
      // WebGL does not have multisample texture, so renderbuffer is needed to resolve MSAA
      gl.bindRenderbuffer(GLenum.RENDERBUFFER, (this.glrb = gl.createRenderbuffer()));
      if (this.props.samples > 1) {
        (gl as WebGL2RenderingContext).renderbufferStorageMultisample(GLenum.RENDERBUFFER, this.props.samples,
          glInternalFormat, this.props.width, this.props.height);
      } else {
        gl.renderbufferStorage(GLenum.RENDERBUFFER, glInternalFormat, this.props.width, this.props.height);
      }
    }
    
    if (!renderTarget) { // Normal texture
      gl.activeTexture(GLenum.TEXTURE0);
      gl.bindTexture(type, this.glt = gl.createTexture());
      gl.texParameteri(type, GLenum.TEXTURE_MIN_FILTER, this.sampler.minFilter);
      gl.texParameteri(type, GLenum.TEXTURE_MAG_FILTER, this.sampler.magFilter);
      gl.texParameteri(type, GLenum.TEXTURE_WRAP_S, this.sampler.wrapU);
      gl.texParameteri(type, GLenum.TEXTURE_WRAP_T, this.sampler.wrapV);
      if (webgl2) {
        gl.texParameteri(type, GLenum.TEXTURE_WRAP_R, this.sampler.wrapW);
        gl.texParameterf(type, GLenum.TEXTURE_MAX_LOD, this.sampler.maxLOD);
        gl.texParameterf(type, GLenum.TEXTURE_MIN_LOD, this.sampler.minLOD);
      }
      if (this.sampler.maxAniso > 1) {
        gl.texParameterf(
          type,
          GLenum.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(this.sampler.maxAniso, gl.getParameter(GLenum.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) as Float
        );
      }

      if (webgl2) {
        if (is3DTexture(type)) {
          (gl as WebGL2RenderingContext).texStorage3D(type, this.props.mipLevels, glInternalFormat, this.props.width, this.props.height,
            this.props.depth);
        } else {
          (gl as WebGL2RenderingContext).texStorage2D(type, this.props.mipLevels, glInternalFormat, this.props.width, this.props.height);
        }
      } else {
        const glFormat = glTexFormat(format);  
        const glType = glTexType(format, this.webgl2);
        const baseTarget = isCube ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X : type;
        const targetCount = isCube ? 6 : 1;
        for (let i = 0; i < targetCount; ++i) {
          for (let level = 0; level < this.props.mipLevels; ++level) {
            gl.texImage2D(baseTarget + i, level, glInternalFormat,
              (this.props.width >> level) || 1, (this.props.height >> level) || 1, 0,
              glFormat, glType, null);
          }
        }
      }
    }
  }

  public data(
    data: TextureData,
    [x, y, z = 0]: ReadonlyOrigin2D | ReadonlyOrigin3D = [0, 0],
    [
      width,
      height,
      depth = (this.props.depth as Float) - z
    ]: ReadonlyExtent2D | ReadonlyExtent3D = [
      (this.props.width as Float) - x,
      (this.props.height as Float) - y
    ],
    mipLevel: Uint = 0
  ): GLTexture {
    const glFormat = glTexFormat(this.props.format);
    const glType = glTexType(this.props.format, this.webgl2);
    const isCube = this.props.type === TexType.Cube;
    const isTexArray = this.props.type === TexType.Array;
    const baseTarget = isCube ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + z : this.props.type;

    this.gl.activeTexture(GLenum.TEXTURE0);
    this.gl.bindTexture(this.props.type, this.glt);

    const targetCount = ((isCube || isTexArray) && (data.images?.length || data.buffers?.length)) || 1;
    let buffer: ArrayBufferView | null = data.buffer || null;
    let image: ImageSource | null = data.image || null;

    for (let i = 0; i < targetCount; ++i) {
      buffer = data.buffers?.[i] || buffer;
      image = data.images?.[i] || image;
      if (is3DTexture(this.props.type)) {
        (this.gl as WebGL2RenderingContext).texSubImage3D(baseTarget, mipLevel, x, y, z + i * depth, width, height, depth,
          glFormat, glType, (image || buffer) as ArrayBufferView | null);
      } else {
        if (buffer || (this.webgl2 && image)) {
          this.gl.texSubImage2D(baseTarget + i, mipLevel, x, y, width, height, glFormat, glType,
            (image || buffer) as ArrayBufferView | null);
        } else if (image) {
          this.gl.texSubImage2D(baseTarget + i, mipLevel, x, y, glFormat, glType, image);
        }
      }
    }

    return this;
  }

  public mipmap(type: MipmapHint = MipmapHint.None): GLTexture {
    this.gl.activeTexture(GLenum.TEXTURE0);
    this.gl.bindTexture(this.props.type, this.glt);
    this.gl.hint(GLenum.GENERATE_MIPMAP_HINT, type);
    this.gl.generateMipmap(this.props.type);
    return this;
  }

  public destroy(): void {
    this.gl.deleteTexture(this.glt);
    this.gl.deleteRenderbuffer(this.glrb);
    this.glt = this.glrb = null;
  }
}
