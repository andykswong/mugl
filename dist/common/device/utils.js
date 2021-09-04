import*as GLenum from"../gl/const.js";const TEX_INTERNAL_FORMAT_MAP=[GLenum.NONE,GLenum.DEPTH_COMPONENT16,GLenum.DEPTH_STENCIL,GLenum.DEPTH_STENCIL,GLenum.RGBA8,GLenum.RGBA32F,GLenum.RGBA16F,GLenum.R32F,GLenum.R16F,GLenum.RG32F,GLenum.RG16F];const TEX_FORMAT_MAP=[GLenum.NONE,GLenum.DEPTH_COMPONENT,GLenum.DEPTH_STENCIL,GLenum.DEPTH_STENCIL,GLenum.RGBA,GLenum.RED,GLenum.RG];const TEX_TYPE_MAP=[GLenum.NONE,GLenum.UNSIGNED_BYTE,GLenum.FLOAT,GLenum.HALF_FLOAT_OES,GLenum.UNSIGNED_INT,GLenum.UNSIGNED_INT_24_8_WEBGL];const VERTEX_TYPE_MAP=[GLenum.FLOAT,GLenum.BYTE,GLenum.UNSIGNED_BYTE,GLenum.SHORT,GLenum.UNSIGNED_SHORT];const VERTEX_TYPE_SIZE_MAP=[4,1,1,2,2];export const BYTE_MASK=255;export function is3DTexture(type){return type===GLenum.TEXTURE_3D||type===GLenum.TEXTURE_2D_ARRAY}export function isDepthStencil(format){return format>0&&format>>16<=3}export function hasStencil(format){return(format&BYTE_MASK)===5}export function vertexByteSize(format){return VERTEX_TYPE_SIZE_MAP[format&BYTE_MASK]*vertexSize(format)}export function vertexSize(format){return format>>8&BYTE_MASK}export function vertexType(format){return VERTEX_TYPE_MAP[format&BYTE_MASK]}export function vertexNormalized(format){return!!(format>>16)}export function indexSize(format){return format-GLenum.UNSIGNED_SHORT+2}export function glTexInternalFormat(format,isWebGL2=false){return isWebGL2||isDepthStencil(format)?TEX_INTERNAL_FORMAT_MAP[format>>16]:glTexFormat(format)}export function glTexFormat(format){return TEX_FORMAT_MAP[format>>8&BYTE_MASK]}export function glTexType(format,isWebGL2=false){const type=TEX_TYPE_MAP[format&BYTE_MASK];if(isWebGL2&&type===GLenum.HALF_FLOAT_OES){return GLenum.HALF_FLOAT}return type}
//# sourceMappingURL=utils.js.map