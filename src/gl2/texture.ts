import {
  AddressMode, Extent3D, FilterMode, GLRenderingDevice, glTexInternalFormat, GLTexture as IGLTexture, glTexFormat,
  glTexType, isDepthStencil, is3DTexture, MinFilterMode, MipmapHint, Origin3D, PixelFormat, SamplerDescriptor,
  TextureData, TextureDescriptor, TexType
} from '../device';
import {
  GL_CLAMP_TO_EDGE, GL_DONT_CARE, GL_GENERATE_MIPMAP_HINT, GL_LINEAR, GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT,
  GL_RENDERBUFFER, GL_TEXTURE0, GL_TEXTURE_2D, GL_TEXTURE_2D_ARRAY, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
  GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MAX_ANISOTROPY_EXT, GL_TEXTURE_MAX_LOD, GL_TEXTURE_MIN_FILTER, GL_TEXTURE_MIN_LOD,
  GL_TEXTURE_WRAP_R, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T
} from '../device';

const EMPTY = {};
const EMPTY3: [number?, number?, number?] = [];

export class GLTexture implements IGLTexture {
  public readonly type: TexType;
  public readonly format: PixelFormat;
  public readonly size: Readonly<Required<Extent3D>>;
  public readonly mipLevels: number;
  public readonly samples: number;
  public readonly renderTarget: boolean;

  public readonly wrapU: AddressMode;
  public readonly wrapV: AddressMode;
  public readonly wrapW: AddressMode;
  public readonly magFilter: FilterMode;
  public readonly minFilter: MinFilterMode;
  public readonly minLOD: number;
  public readonly maxLOD: number;
  public readonly maxAniso: number;

  public glt: WebGLTexture | null;
  public glrb: WebGLRenderbuffer | null;

  private readonly gl: WebGLRenderingContext;
  private readonly webgl2: boolean;

  public constructor(
    context: GLRenderingDevice, {
      size: [width, height, depth = 1],
      type = GL_TEXTURE_2D,
      format = PixelFormat.RGBA8,
      mipLevels = 1,
      samples = 1,
      renderTarget = true
    }: TextureDescriptor, {
      wrapU = GL_CLAMP_TO_EDGE,
      wrapV = GL_CLAMP_TO_EDGE,
      wrapW = GL_CLAMP_TO_EDGE,
      magFilter = GL_LINEAR,
      minFilter = GL_LINEAR,
      maxLOD = Number.MAX_VALUE,
      minLOD = 0,
      maxAniso = 1
    }: SamplerDescriptor = EMPTY
  ) {
    const gl = this.gl = context.gl;
    this.webgl2 = context.webgl2;
    const isCube = type === GL_TEXTURE_CUBE_MAP;

    this.size = [width, height, isCube ? 6 : depth];
    this.type = type;
    this.format = format;
    this.mipLevels = mipLevels;
    this.samples = samples;
    this.wrapU = wrapU;
    this.wrapV = wrapV;
    this.wrapW = wrapW;
    this.magFilter = magFilter;
    this.minFilter = minFilter;
    this.maxLOD = maxLOD;
    this.minLOD = minLOD;
    this.maxAniso = maxAniso;

    const useRenderbuffer = this.renderTarget = isDepthStencil(format) && renderTarget;
    const glInternalFormat = glTexInternalFormat(format, this.webgl2);

    let glt: WebGLTexture | null = null;
    let glrb: WebGLRenderbuffer | null = null;

    if (useRenderbuffer || samples > 1) { // Depth-stencil / MSAA renderbuffer
      // WebGL does not have multisample texture, so renderbuffer is needed to resolve MSAA
      glrb = gl.createRenderbuffer();
      gl.bindRenderbuffer(GL_RENDERBUFFER, glrb);
      if (samples > 1) {
        (gl as WebGL2RenderingContext).renderbufferStorageMultisample(GL_RENDERBUFFER, samples,
          glInternalFormat, width, height);
      } else {
        gl.renderbufferStorage(GL_RENDERBUFFER, glInternalFormat, width, height);
      }
    }
    
    if (!useRenderbuffer) { // Normal texture
      glt = gl.createTexture();
      gl.activeTexture(GL_TEXTURE0);
      gl.bindTexture(type, glt);
      gl.texParameteri(type, GL_TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(type, GL_TEXTURE_MAG_FILTER, magFilter);
      gl.texParameteri(type, GL_TEXTURE_WRAP_S, wrapU);
      gl.texParameteri(type, GL_TEXTURE_WRAP_T, wrapV);
      if (context.webgl2) {
        gl.texParameteri(type, GL_TEXTURE_WRAP_R, wrapW);
        gl.texParameterf(type, GL_TEXTURE_MAX_LOD, maxLOD);
        gl.texParameterf(type, GL_TEXTURE_MIN_LOD, minLOD);
      }
      if (maxAniso > 1) {
        gl.texParameterf(
          type,
          GL_TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(maxAniso, gl.getParameter(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT))
        );
      }

      if (this.webgl2) {
        if (is3DTexture(type)) {
          (gl as WebGL2RenderingContext).texStorage3D(type, mipLevels, glInternalFormat, width, height, depth);
        } else {
          (gl as WebGL2RenderingContext).texStorage2D(type, mipLevels, glInternalFormat, width, height);
        }
      } else {
        const glFormat = glTexFormat(format);  
        const glType = glTexType(format, this.webgl2);
        const baseTarget = isCube ? GL_TEXTURE_CUBE_MAP_POSITIVE_X : type;
        const targetCount = isCube ? 6 : 1;
        for (let i = 0; i < targetCount; ++i) {
          for (let level = 0; level < mipLevels; ++level) {
            gl.texImage2D(baseTarget + i, level, glInternalFormat, (width >> level) || 1, (height >> level) || 1, 0,
              glFormat, glType, null);
          }
        }
      }
    }

    this.glt = glt;
    this.glrb = glrb;
  }

  data(
    data: TextureData | TextureData[],
    [x = 0, y = 0, z = 0]: Origin3D = EMPTY3,
    [
      width = this.size[0] - x,
      height = this.size[1] - y,
      depth = this.size[2] - z,
    ]: Extent3D = EMPTY3,
    mipLevel = 0
  ): GLTexture {
    const { gl, glt, type, format } = this;
    const glFormat = glTexFormat(format);
    const glType = glTexType(format, this.webgl2);
    const isCube = type === GL_TEXTURE_CUBE_MAP;
    const isTexArray = type === GL_TEXTURE_2D_ARRAY;
    const dataArr = Array.isArray(data) ? data : [data];
    const targetCount = (isCube || isTexArray) ? dataArr.length : 1;
    const baseTarget = isCube ? GL_TEXTURE_CUBE_MAP_POSITIVE_X + z : type;

    gl.activeTexture(GL_TEXTURE0);
    gl.bindTexture(type, glt);

    for (let i = 0; i < targetCount; ++i) {
      if (is3DTexture(type)) {
        (gl as WebGL2RenderingContext).texSubImage3D(baseTarget, mipLevel, x, y, z + i * depth, width, height, depth,
          glFormat, glType, dataArr[i] as ArrayBufferView);
      } else if (this.webgl2 || ArrayBuffer.isView(data)) {
        gl.texSubImage2D(baseTarget + i, mipLevel, x, y, width, height, glFormat, glType, dataArr[i] as ArrayBufferView);
      } else {
        gl.texSubImage2D(baseTarget + i, mipLevel, x, y, glFormat, glType, dataArr[i] as TexImageSource);
      }
    }

    return this;
  }

  mipmap(hint: MipmapHint = GL_DONT_CARE): GLTexture {
    this.gl.activeTexture(GL_TEXTURE0);
    this.gl.bindTexture(this.type, this.glt);
    this.gl.hint(GL_GENERATE_MIPMAP_HINT, hint);
    this.gl.generateMipmap(this.type);
    return this;
  }

  destroy(): void {
    this.gl.deleteTexture(this.glt);
    this.gl.deleteRenderbuffer(this.glrb);
    this.glt = this.glrb = null;
  }
}
