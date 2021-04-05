/**
 * All {@link WebGLRenderingContext} and extension constants used.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
 * @packageDocumentation
 */

/**
 * {@link WebGLRenderingContext.NONE}
 */
export const GL_NONE = 0;

// Clearing buffers

/**
 * {@link WebGLRenderingContext.DEPTH_BUFFER_BIT}
 */
export const GL_DEPTH_BUFFER_BIT = 0x00000100;

/**
 * {@link WebGLRenderingContext.STENCIL_BUFFER_BIT}
 */
export const GL_STENCIL_BUFFER_BIT = 0x00000400;

/**
 * {@link WebGLRenderingContext.COLOR_BUFFER_BIT}
 */
export const GL_COLOR_BUFFER_BIT = 0x00004000;

// Rendering primitives

/**
 * {@link WebGLRenderingContext.POINTS}
 */
export const GL_POINTS = 0x0000;

/**
 * {@link WebGLRenderingContext.LINES}
 */
export const GL_LINES = 0x0001;

/**
 * {@link WebGLRenderingContext.LINE_STRIP}
 */
export const GL_LINE_STRIP = 0x0003;

/**
 * {@link WebGLRenderingContext.TRIANGLES}
 */
export const GL_TRIANGLES = 0x0004;

/**
 * {@link WebGLRenderingContext.TRIANGLE_STRIP}
 */
export const GL_TRIANGLE_STRIP = 0x0005;

// Blending modes

/**
 * {@link WebGLRenderingContext.ZERO}
 */
export const GL_ZERO = 0;

/**
 * {@link WebGLRenderingContext.ONE}
 */
export const GL_ONE = 1;

/**
 * {@link WebGLRenderingContext.SRC_COLOR}
 */
export const GL_SRC_COLOR = 0x0300;

/**
 * {@link WebGLRenderingContext.ONE_MINUS_SRC_COLOR}
 */
export const GL_ONE_MINUS_SRC_COLOR = 0x0301;

/**
 * {@link WebGLRenderingContext.SRC_ALPHA}
 */
export const GL_SRC_ALPHA = 0x0302;

/**
 * {@link WebGLRenderingContext.ONE_MINUS_SRC_ALPHA}
 */
export const GL_ONE_MINUS_SRC_ALPHA = 0x0303;

/**
 * {@link WebGLRenderingContext.DST_ALPHA}
 */
export const GL_DST_ALPHA = 0x0304;

/**
 * {@link WebGLRenderingContext.ONE_MINUS_DST_ALPHA}
 */
export const GL_ONE_MINUS_DST_ALPHA = 0x0305;

/**
 * {@link WebGLRenderingContext.DST_COLOR}
 */
export const GL_DST_COLOR = 0x0306;

/**
 * {@link WebGLRenderingContext.ONE_MINUS_DST_COLOR}
 */
export const GL_ONE_MINUS_DST_COLOR = 0x0307;

/**
 * {@link WebGLRenderingContext.SRC_ALPHA_SATURATE}
 */
export const GL_SRC_ALPHA_SATURATE = 0x0308;

/**
 * {@link WebGLRenderingContext.CONSTANT_COLOR}
 */
export const GL_CONSTANT_COLOR = 0x8001;

/**
 * {@link WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR}
 */
export const GL_ONE_MINUS_CONSTANT_COLOR = 0x8002;

// Blending equations

/**
 * {@link WebGLRenderingContext.FUNC_ADD}
 */
export const GL_FUNC_ADD = 0x8006;

/**
 * {@link WebGLRenderingContext.FUNC_SUBTRACT}
 */
export const GL_FUNC_SUBTRACT = 0x800A;

/**
 * {@link WebGLRenderingContext.FUNC_REVERSE_SUBTRACT}
 */
export const GL_FUNC_REVERSE_SUBTRACT = 0x800B;

// Buffers

/**
 * {@link WebGLRenderingContext.STATIC_DRAW}
 */
export const GL_STATIC_DRAW = 0x88E4;

/**
 * {@link WebGLRenderingContext.STREAM_DRAW}
 */
export const GL_STREAM_DRAW = 0x88E0;

/**
 * {@link WebGLRenderingContext.DYNAMIC_DRAW}
 */
export const GL_DYNAMIC_DRAW = 0x88E8;

/**
 * {@link WebGLRenderingContext.ARRAY_BUFFER}
 */
export const GL_ARRAY_BUFFER = 0x8892;

/**
 * {@link WebGLRenderingContext.ELEMENT_ARRAY_BUFFER}
 */
export const GL_ELEMENT_ARRAY_BUFFER = 0x8893;

// Culling

/**
 * {@link WebGLRenderingContext.CULL_FACE}
 */
export const GL_CULL_FACE = 0x0B44;

/**
 * {@link WebGLRenderingContext.FRONT}
 */
export const GL_FRONT = 0x0404;

/**
 * {@link WebGLRenderingContext.BACK}
 */
export const GL_BACK = 0x0405;

// Enabling and disabling

/**
 * {@link WebGLRenderingContext.BLEND}
 */
export const GL_BLEND = 0x0BE2;

/**
 * {@link WebGLRenderingContext.DEPTH_TEST}
 */
export const GL_DEPTH_TEST = 0x0B71;

/**
 * {@link WebGLRenderingContext.POLYGON_OFFSET_FILL}
 */
export const GL_POLYGON_OFFSET_FILL = 0x8037;

/**
 * {@link WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE}
 */
export const GL_SAMPLE_ALPHA_TO_COVERAGE = 0x809E;

/**
 * {@link WebGLRenderingContext.SAMPLE_COVERAGE}
 */
export const GL_SAMPLE_COVERAGE	= 0x80A0;

/**
 * {@link WebGLRenderingContext.SCISSOR_TEST}
 */
export const GL_SCISSOR_TEST = 0x0C11;

/**
 * {@link WebGLRenderingContext.STENCIL_TEST}
 */
export const GL_STENCIL_TEST = 0x0B90;

// Front face directions

/**
 * {@link WebGLRenderingContext.CW}
 */
export const GL_CW = 0x0900;

/**
 * {@link WebGLRenderingContext.CCW}
 */
export const GL_CCW = 0x0901;

// Hints

/**
 * {@link WebGLRenderingContext.DONT_CARE}
 */
export const GL_DONT_CARE = 0x1100;

/**
 * {@link WebGLRenderingContext.FASTEST}
 */
export const GL_FASTEST = 0x1101;

/**
 * {@link WebGLRenderingContext.NICEST}
 */
export const GL_NICEST = 0x1102;

/**
 * {@link WebGLRenderingContext.GENERATE_MIPMAP_HINT}
 */
export const GL_GENERATE_MIPMAP_HINT = 0x8192;

// Data types

/**
 * {@link WebGLRenderingContext.BYTE}
 */
export const GL_BYTE = 0x1400;

/**
 * {@link WebGLRenderingContext.UNSIGNED_BYTE}
 */
export const GL_UNSIGNED_BYTE = 0x1401;

/**
 * {@link WebGLRenderingContext.SHORT}
 */
export const GL_SHORT = 0x1402;

/**
 * {@link WebGLRenderingContext.UNSIGNED_SHORT}
 */
export const GL_UNSIGNED_SHORT = 0x1403;

/**
 * {@link WebGLRenderingContext.INT}
 */
export const GL_INT = 0x1404;

/**
 * {@link WebGLRenderingContext.UNSIGNED_INT}
 */
export const GL_UNSIGNED_INT = 0x1405;

/**
 * {@link WebGLRenderingContext.FLOAT}
 */
export const GL_FLOAT = 0x1406;

// Pixel formats

/**
 * {@link WebGLRenderingContext.DEPTH_COMPONENT}
 */
export const GL_DEPTH_COMPONENT = 0x1902;

/**
 * {@link WebGLRenderingContext.RGBA}
 */
export const GL_RGBA = 0x1908;

/**
 * {@link WebGLRenderingContext.LUMINANCE}
 */
export const GL_LUMINANCE = 0x1909;

// Shaders

/**
 * {@link WebGLRenderingContext.FRAGMENT_SHADER}
 */
export const GL_FRAGMENT_SHADER = 0x8B30;

/**
 * {@link WebGLRenderingContext.VERTEX_SHADER}
 */
export const GL_VERTEX_SHADER = 0x8B31;

/**
 * {@link WebGLRenderingContext.COMPILE_STATUS}
 */
export const GL_COMPILE_STATUS = 0x8B81;

/**
 * {@link WebGLRenderingContext.LINK_STATUS}
 */
export const GL_LINK_STATUS = 0x8B82;

/**
 * {@link WebGLRenderingContext.MAX_VERTEX_ATTRIBS}
 */
export const GL_MAX_VERTEX_ATTRIBS = 0x8869;

/**
 * {@link WebGLRenderingContext.MAX_TEXTURE_IMAGE_UNITS}
 */
export const GL_MAX_TEXTURE_IMAGE_UNITS = 0x8872;

// Depth or stencil tests

/**
 * {@link WebGLRenderingContext.NEVER}
 */
export const GL_NEVER = 0x0200;

/**
 * {@link WebGLRenderingContext.LESS}
 */
export const GL_LESS = 0x0201;

/**
 * {@link WebGLRenderingContext.EQUAL}
 */
export const GL_EQUAL = 0x0202;

/**
 * {@link WebGLRenderingContext.LEQUAL}
 */
export const GL_LEQUAL = 0x0203;

/**
 * {@link WebGLRenderingContext.GREATER}
 */
export const GL_GREATER = 0x0204;

/**
 * {@link WebGLRenderingContext.NOTEQUAL}
 */
export const GL_NOTEQUAL = 0x0205;

/**
 * {@link WebGLRenderingContext.GEQUAL}
 */
export const GL_GEQUAL = 0x0206;

/**
 * {@link WebGLRenderingContext.ALWAYS}
 */
export const GL_ALWAYS = 0x0207;

// Stencil actions

/**
 * {@link WebGLRenderingContext.KEEP}
 */
export const GL_KEEP = 0x1E00;

/**
 * {@link WebGLRenderingContext.REPLACE}
 */
export const GL_REPLACE = 0x1E01;

/**
 * {@link WebGLRenderingContext.INCR}
 */
export const GL_INCR = 0x1E02;

/**
 * {@link WebGLRenderingContext.DECR}
 */
export const GL_DECR = 0x1E03;

/**
 * {@link WebGLRenderingContext.INVERT}
 */
export const GL_INVERT = 0x150A;

/**
 * {@link WebGLRenderingContext.INCR_WRAP}
 */
export const GL_INCR_WRAP = 0x8507;

/**
 * {@link WebGLRenderingContext.DECR_WRAP}
 */
export const GL_DECR_WRAP = 0x8508;

// Textures

/**
 * {@link WebGLRenderingContext.NEAREST}
 */
export const GL_NEAREST = 0x2600;

/**
 * {@link WebGLRenderingContext.LINEAR}
 */
export const GL_LINEAR = 0x2601;

/**
 * {@link WebGLRenderingContext.NEAREST_MIPMAP_NEAREST}
 */
export const GL_NEAREST_MIPMAP_NEAREST = 0x2700;

/**
 * {@link WebGLRenderingContext.LINEAR_MIPMAP_NEAREST}
 */
export const GL_LINEAR_MIPMAP_NEAREST = 0x2701;

/**
 * {@link WebGLRenderingContext.NEAREST_MIPMAP_LINEAR}
 */
export const GL_NEAREST_MIPMAP_LINEAR = 0x2702;

/**
 * {@link WebGLRenderingContext.LINEAR_MIPMAP_LINEAR}
 */
export const GL_LINEAR_MIPMAP_LINEAR = 0x2703;

/**
 * {@link WebGLRenderingContext.TEXTURE_MAG_FILTER}
 */
export const GL_TEXTURE_MAG_FILTER = 0x2800;

/**
 * {@link WebGLRenderingContext.TEXTURE_MIN_FILTER}
 */
export const GL_TEXTURE_MIN_FILTER = 0x2801;

/**
 * {@link WebGLRenderingContext.TEXTURE_WRAP_S}
 */
export const GL_TEXTURE_WRAP_S = 0x2802;

/**
 * {@link WebGLRenderingContext.TEXTURE_WRAP_T}
 */
export const GL_TEXTURE_WRAP_T = 0x2803;

/**
 * {@link WebGLRenderingContext.TEXTURE_2D}
 */
export const GL_TEXTURE_2D = 0x0DE1;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP}
 */
export const GL_TEXTURE_CUBE_MAP = 0x8513;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X}
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X}
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y}
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y}
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z}
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;

/**
 * {@link WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z}
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;

/**
 * {@link WebGLRenderingContext.TEXTURE0}
 */
export const GL_TEXTURE0 = 0x84C0;

/**
 * {@link WebGLRenderingContext.REPEAT}
 */
export const GL_REPEAT = 0x2901;

/**
 * {@link WebGLRenderingContext.CLAMP_TO_EDGE}
 */
export const GL_CLAMP_TO_EDGE = 0x812F;

/**
 * {@link WebGLRenderingContext.MIRRORED_REPEAT}
 */
export const GL_MIRRORED_REPEAT = 0x8370;

// Uniform types

/**
 * {@link WebGLRenderingContext.FLOAT_VEC2}
 */
export const GL_FLOAT_VEC2 = 0x8B50;

/**
 * {@link WebGLRenderingContext.FLOAT_VEC3}
 */
export const GL_FLOAT_VEC3 = 0x8B51;

/**
 * {@link WebGLRenderingContext.FLOAT_VEC4}
 */
export const GL_FLOAT_VEC4 = 0x8B52;

/**
 * {@link WebGLRenderingContext.INT_VEC2}
 */
export const GL_INT_VEC2 = 0x8B53;

/**
 * {@link WebGLRenderingContext.INT_VEC3}
 */
export const GL_INT_VEC3 = 0x8B54;

/**
 * {@link WebGLRenderingContext.INT_VEC4}
 */
export const GL_INT_VEC4 = 0x8B55;

/**
 * {@link WebGLRenderingContext.BOOL}
 */
export const GL_BOOL = 0x8B56;

/**
 * {@link WebGLRenderingContext.BOOL_VEC2}
 */
export const GL_BOOL_VEC2 = 0x8B57;

/**
 * {@link WebGLRenderingContext.BOOL_VEC3}
 */
export const GL_BOOL_VEC3 = 0x8B58;

/**
 * {@link WebGLRenderingContext.BOOL_VEC4}
 */
export const GL_BOOL_VEC4 = 0x8B59;

/**
 * {@link WebGLRenderingContext.FLOAT_MAT2}
 */
export const GL_FLOAT_MAT2 = 0x8B5A;

/**
 * {@link WebGLRenderingContext.FLOAT_MAT3}
 */
export const GL_FLOAT_MAT3 = 0x8B5B;

/**
 * {@link WebGLRenderingContext.FLOAT_MAT4}
 */
export const GL_FLOAT_MAT4 = 0x8B5C;

/**
 * {@link WebGLRenderingContext.SAMPLER_2D}
 */
export const GL_SAMPLER_2D = 0x8B5E;
 
/**
 * {@link WebGLRenderingContext.SAMPLER_CUBE}
 */
export const GL_SAMPLER_CUBE = 0x8B60;

// Framebuffers and renderbuffers

/**
 * {@link WebGLRenderingContext.FRAMEBUFFER}
 */
export const GL_FRAMEBUFFER = 0x8D40;

/**
 * {@link WebGLRenderingContext.RENDERBUFFER}
 */
export const GL_RENDERBUFFER = 0x8D41;

/**
 * {@link WebGLRenderingContext.DEPTH_COMPONENT16}
 */
export const GL_DEPTH_COMPONENT16 = 0x81A5;

/**
 * {@link WebGLRenderingContext.STENCIL_INDEX8}
 */
export const GL_STENCIL_INDEX8 = 0x8D48;

/**
 * {@link WebGLRenderingContext.DEPTH_STENCIL}
 */
export const GL_DEPTH_STENCIL = 0x84F9;

/**
 * {@link WebGLRenderingContext.COLOR_ATTACHMENT0}
 */
export const GL_COLOR_ATTACHMENT0 = 0x8CE0;

/**
 * {@link WebGLRenderingContext.DEPTH_ATTACHMENT}
 */
export const GL_DEPTH_ATTACHMENT = 0x8D00;

/**
 * {@link WebGLRenderingContext.STENCIL_ATTACHMENT}
 */
export const GL_STENCIL_ATTACHMENT = 0x8D20;

/**
 * {@link WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT}
 */
export const GL_DEPTH_STENCIL_ATTACHMENT = 0x821A;

/**
 * {@link WebGLRenderingContext.FRAMEBUFFER_COMPLETE}
 */
export const GL_FRAMEBUFFER_COMPLETE = 0x8CD5;

// EXT_blend_minmax

/**
 * {@link EXT_blend_minmax.MIN_EXT}
 * {@link WebGL2RenderingContext.MIN}
 */
export const GL_MIN_EXT = 0x8007;

/**
 * {@link EXT_blend_minmax.MAX_EXT}
 * {@link WebGL2RenderingContext.MAX}
 */
export const GL_MAX_EXT = 0x8008;

// EXT_texture_filter_anisotropic

/**
 * {@link EXT_texture_filter_anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT}
 */
export const GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

/**
 * {@link EXT_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT}
 */
export const GL_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;

// WEBGL_depth_texture

/**
 * {@link WEBGL_depth_texture.UNSIGNED_INT_24_8_WEBGL}
 */
export const GL_UNSIGNED_INT_24_8_WEBGL = 0x84FA;

// OES_texture_half_float

/**
 * {@link OES_texture_half_float.HALF_FLOAT_OES}
 */
export const GL_HALF_FLOAT_OES = 0x8D61;

// WebGL2 Constants

// Textures

/**
 * {@link WebGL2RenderingContext.RED}
 */
export const GL_RED = 0x1903;

/**
 * {@link WebGL2RenderingContext.RGBA8}
 */
export const GL_RGBA8 = 0x8058;

/**
 * {@link WebGL2RenderingContext.TEXTURE_3D}
 */
export const GL_TEXTURE_3D = 0x806F;

/**
 * {@link WebGL2RenderingContext.TEXTURE_WRAP_R}
 */
export const GL_TEXTURE_WRAP_R = 0x8072;

/**
 * {@link WebGL2RenderingContext.TEXTURE_MIN_LOD}
 */
export const GL_TEXTURE_MIN_LOD = 0x813A;

/**
 * {@link WebGL2RenderingContext.TEXTURE_MAX_LOD}
 */
export const GL_TEXTURE_MAX_LOD = 0x813B;

/**
 * {@link WebGL2RenderingContext.RGBA32F}
 */
export const GL_RGBA32F = 0x8814;

/**
 * {@link WebGL2RenderingContext.RGBA16F}
 */
export const GL_RGBA16F = 0x881A;

/**
 * {@link WebGL2RenderingContext.TEXTURE_2D_ARRAY}
 */
export const GL_TEXTURE_2D_ARRAY = 0x8C1A;

/**
 * {@link WebGL2RenderingContext.R16F}
 */
export const GL_R16F = 0x822D;

/**
 * {@link WebGL2RenderingContext.R32F}
 */
export const GL_R32F = 0x822E;

/**
 * {@link WebGL2RenderingContext.RG16F}
 */
export const GL_RG16F = 0x822F;

/**
 * {@link WebGL2RenderingContext.RG32F}
 */
export const GL_RG32F = 0x8230;

// Pixel types

/**
 * {@link WebGL2RenderingContext.HALF_FLOAT}
 */
export const GL_HALF_FLOAT = 0x140B;

/**
 * {@link WebGL2RenderingContext.RG}
 */
export const GL_RG = 0x8227;

// Samplers

/**
 * {@link WebGL2RenderingContext.SAMPLER_3D}
 */
export const GL_SAMPLER_3D = 0x8B5F;

/**
 * {@link WebGL2RenderingContext.SAMPLER_2D_ARRAY}
 */
export const GL_SAMPLER_2D_ARRAY = 0x8DC1;

// Framebuffers and renderbuffers

/**
 * {@link WebGL2RenderingContext.READ_FRAMEBUFFER}
 */
export const GL_READ_FRAMEBUFFER = 0x8CA8;

/**
 * {@link WebGL2RenderingContext.DRAW_FRAMEBUFFER}
 */
export const GL_DRAW_FRAMEBUFFER = 0x8CA9;
