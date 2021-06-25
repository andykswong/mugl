/**
 * All WebGLRenderingContext and extension constants used.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
 * @packageDocumentation
 * @internal
 */

/**
 * WebGLRenderingContext.NONE
 * @internal
 */
export const GL_NONE = 0;

// Clearing buffers

/**
 * WebGLRenderingContext.DEPTH_BUFFER_BIT
 * @internal
 */
export const GL_DEPTH_BUFFER_BIT = 0x00000100;

/**
 * WebGLRenderingContext.STENCIL_BUFFER_BIT
 * @internal
 */
export const GL_STENCIL_BUFFER_BIT = 0x00000400;

/**
 * WebGLRenderingContext.COLOR_BUFFER_BIT
 * @internal
 */
export const GL_COLOR_BUFFER_BIT = 0x00004000;

// Rendering primitives

/**
 * WebGLRenderingContext.POINTS
 * @internal
 */
export const GL_POINTS = 0x0000;

/**
 * WebGLRenderingContext.LINES
 * @internal
 */
export const GL_LINES = 0x0001;

/**
 * WebGLRenderingContext.LINE_STRIP
 * @internal
 */
export const GL_LINE_STRIP = 0x0003;

/**
 * WebGLRenderingContext.TRIANGLES
 * @internal
 */
export const GL_TRIANGLES = 0x0004;

/**
 * WebGLRenderingContext.TRIANGLE_STRIP
 * @internal
 */
export const GL_TRIANGLE_STRIP = 0x0005;

// Blending modes

/**
 * WebGLRenderingContext.ZERO
 * @internal
 */
export const GL_ZERO = 0;

/**
 * WebGLRenderingContext.ONE
 * @internal
 */
export const GL_ONE = 1;

/**
 * WebGLRenderingContext.SRC_COLOR
 * @internal
 */
export const GL_SRC_COLOR = 0x0300;

/**
 * WebGLRenderingContext.ONE_MINUS_SRC_COLOR
 * @internal
 */
export const GL_ONE_MINUS_SRC_COLOR = 0x0301;

/**
 * WebGLRenderingContext.SRC_ALPHA
 * @internal
 */
export const GL_SRC_ALPHA = 0x0302;

/**
 * WebGLRenderingContext.ONE_MINUS_SRC_ALPHA
 * @internal
 */
export const GL_ONE_MINUS_SRC_ALPHA = 0x0303;

/**
 * WebGLRenderingContext.DST_ALPHA
 * @internal
 */
export const GL_DST_ALPHA = 0x0304;

/**
 * WebGLRenderingContext.ONE_MINUS_DST_ALPHA
 * @internal
 */
export const GL_ONE_MINUS_DST_ALPHA = 0x0305;

/**
 * WebGLRenderingContext.DST_COLOR
 * @internal
 */
export const GL_DST_COLOR = 0x0306;

/**
 * WebGLRenderingContext.ONE_MINUS_DST_COLOR
 * @internal
 */
export const GL_ONE_MINUS_DST_COLOR = 0x0307;

/**
 * WebGLRenderingContext.SRC_ALPHA_SATURATE
 * @internal
 */
export const GL_SRC_ALPHA_SATURATE = 0x0308;

/**
 * WebGLRenderingContext.CONSTANT_COLOR
 * @internal
 */
export const GL_CONSTANT_COLOR = 0x8001;

/**
 * WebGLRenderingContext.ONE_MINUS_CONSTANT_COLOR
 * @internal
 */
export const GL_ONE_MINUS_CONSTANT_COLOR = 0x8002;

// Blending equations

/**
 * WebGLRenderingContext.FUNC_ADD
 * @internal
 */
export const GL_FUNC_ADD = 0x8006;

/**
 * WebGLRenderingContext.FUNC_SUBTRACT
 * @internal
 */
export const GL_FUNC_SUBTRACT = 0x800A;

/**
 * WebGLRenderingContext.FUNC_REVERSE_SUBTRACT
 * @internal
 */
export const GL_FUNC_REVERSE_SUBTRACT = 0x800B;

// Buffers

/**
 * WebGLRenderingContext.STATIC_DRAW
 * @internal
 */
export const GL_STATIC_DRAW = 0x88E4;

/**
 * WebGLRenderingContext.STREAM_DRAW
 * @internal
 */
export const GL_STREAM_DRAW = 0x88E0;

/**
 * WebGLRenderingContext.DYNAMIC_DRAW
 * @internal
 */
export const GL_DYNAMIC_DRAW = 0x88E8;

/**
 * WebGLRenderingContext.ARRAY_BUFFER
 * @internal
 */
export const GL_ARRAY_BUFFER = 0x8892;

/**
 * WebGLRenderingContext.ELEMENT_ARRAY_BUFFER
 * @internal
 */
export const GL_ELEMENT_ARRAY_BUFFER = 0x8893;

// Culling

/**
 * WebGLRenderingContext.CULL_FACE
 * @internal
 */
export const GL_CULL_FACE = 0x0B44;

/**
 * WebGLRenderingContext.FRONT
 * @internal
 */
export const GL_FRONT = 0x0404;

/**
 * WebGLRenderingContext.BACK
 * @internal
 */
export const GL_BACK = 0x0405;

// Enabling and disabling

/**
 * WebGLRenderingContext.BLEND
 * @internal
 */
export const GL_BLEND = 0x0BE2;

/**
 * WebGLRenderingContext.DEPTH_TEST
 * @internal
 */
export const GL_DEPTH_TEST = 0x0B71;

/**
 * WebGLRenderingContext.POLYGON_OFFSET_FILL
 * @internal
 */
export const GL_POLYGON_OFFSET_FILL = 0x8037;

/**
 * WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE
 * @internal
 */
export const GL_SAMPLE_ALPHA_TO_COVERAGE = 0x809E;

/**
 * WebGLRenderingContext.SAMPLE_COVERAGE
 * @internal
 */
export const GL_SAMPLE_COVERAGE	= 0x80A0;

/**
 * WebGLRenderingContext.SCISSOR_TEST
 * @internal
 */
export const GL_SCISSOR_TEST = 0x0C11;

/**
 * WebGLRenderingContext.STENCIL_TEST
 * @internal
 */
export const GL_STENCIL_TEST = 0x0B90;

// Front face directions

/**
 * WebGLRenderingContext.CW
 * @internal
 */
export const GL_CW = 0x0900;

/**
 * WebGLRenderingContext.CCW
 * @internal
 */
export const GL_CCW = 0x0901;

// Hints

/**
 * WebGLRenderingContext.DONT_CARE
 * @internal
 */
export const GL_DONT_CARE = 0x1100;

/**
 * WebGLRenderingContext.FASTEST
 * @internal
 */
export const GL_FASTEST = 0x1101;

/**
 * WebGLRenderingContext.NICEST
 * @internal
 */
export const GL_NICEST = 0x1102;

/**
 * WebGLRenderingContext.GENERATE_MIPMAP_HINT
 * @internal
 */
export const GL_GENERATE_MIPMAP_HINT = 0x8192;

// Data types

/**
 * WebGLRenderingContext.BYTE
 * @internal
 */
export const GL_BYTE = 0x1400;

/**
 * WebGLRenderingContext.UNSIGNED_BYTE
 * @internal
 */
export const GL_UNSIGNED_BYTE = 0x1401;

/**
 * WebGLRenderingContext.SHORT
 * @internal
 */
export const GL_SHORT = 0x1402;

/**
 * WebGLRenderingContext.UNSIGNED_SHORT
 * @internal
 */
export const GL_UNSIGNED_SHORT = 0x1403;

/**
 * WebGLRenderingContext.INT
 * @internal
 */
export const GL_INT = 0x1404;

/**
 * WebGLRenderingContext.UNSIGNED_INT
 * @internal
 */
export const GL_UNSIGNED_INT = 0x1405;

/**
 * WebGLRenderingContext.FLOAT
 * @internal
 */
export const GL_FLOAT = 0x1406;

// Pixel formats

/**
 * WebGLRenderingContext.DEPTH_COMPONENT
 * @internal
 */
export const GL_DEPTH_COMPONENT = 0x1902;

/**
 * WebGLRenderingContext.RGBA
 * @internal
 */
export const GL_RGBA = 0x1908;

/**
 * WebGLRenderingContext.LUMINANCE
 * @internal
 */
export const GL_LUMINANCE = 0x1909;

// Shaders

/**
 * WebGLRenderingContext.FRAGMENT_SHADER
 * @internal
 */
export const GL_FRAGMENT_SHADER = 0x8B30;

/**
 * WebGLRenderingContext.VERTEX_SHADER
 * @internal
 */
export const GL_VERTEX_SHADER = 0x8B31;

/**
 * WebGLRenderingContext.COMPILE_STATUS
 * @internal
 */
export const GL_COMPILE_STATUS = 0x8B81;

/**
 * WebGLRenderingContext.LINK_STATUS
 * @internal
 */
export const GL_LINK_STATUS = 0x8B82;

/**
 * WebGLRenderingContext.MAX_VERTEX_ATTRIBS
 * @internal
 */
export const GL_MAX_VERTEX_ATTRIBS = 0x8869;

/**
 * WebGLRenderingContext.MAX_TEXTURE_IMAGE_UNITS
 * @internal
 */
export const GL_MAX_TEXTURE_IMAGE_UNITS = 0x8872;

// Depth or stencil tests

/**
 * WebGLRenderingContext.NEVER
 * @internal
 */
export const GL_NEVER = 0x0200;

/**
 * WebGLRenderingContext.LESS
 * @internal
 */
export const GL_LESS = 0x0201;

/**
 * WebGLRenderingContext.EQUAL
 * @internal
 */
export const GL_EQUAL = 0x0202;

/**
 * WebGLRenderingContext.LEQUAL
 * @internal
 */
export const GL_LEQUAL = 0x0203;

/**
 * WebGLRenderingContext.GREATER
 * @internal
 */
export const GL_GREATER = 0x0204;

/**
 * WebGLRenderingContext.NOTEQUAL
 * @internal
 */
export const GL_NOTEQUAL = 0x0205;

/**
 * WebGLRenderingContext.GEQUAL
 * @internal
 */
export const GL_GEQUAL = 0x0206;

/**
 * WebGLRenderingContext.ALWAYS
 * @internal
 */
export const GL_ALWAYS = 0x0207;

// Stencil actions

/**
 * WebGLRenderingContext.KEEP
 * @internal
 */
export const GL_KEEP = 0x1E00;

/**
 * WebGLRenderingContext.REPLACE
 * @internal
 */
export const GL_REPLACE = 0x1E01;

/**
 * WebGLRenderingContext.INCR
 * @internal
 */
export const GL_INCR = 0x1E02;

/**
 * WebGLRenderingContext.DECR
 * @internal
 */
export const GL_DECR = 0x1E03;

/**
 * WebGLRenderingContext.INVERT
 * @internal
 */
export const GL_INVERT = 0x150A;

/**
 * WebGLRenderingContext.INCR_WRAP
 * @internal
 */
export const GL_INCR_WRAP = 0x8507;

/**
 * WebGLRenderingContext.DECR_WRAP
 * @internal
 */
export const GL_DECR_WRAP = 0x8508;

// Textures

/**
 * WebGLRenderingContext.NEAREST
 * @internal
 */
export const GL_NEAREST = 0x2600;

/**
 * WebGLRenderingContext.LINEAR
 * @internal
 */
export const GL_LINEAR = 0x2601;

/**
 * WebGLRenderingContext.NEAREST_MIPMAP_NEAREST
 * @internal
 */
export const GL_NEAREST_MIPMAP_NEAREST = 0x2700;

/**
 * WebGLRenderingContext.LINEAR_MIPMAP_NEAREST
 * @internal
 */
export const GL_LINEAR_MIPMAP_NEAREST = 0x2701;

/**
 * WebGLRenderingContext.NEAREST_MIPMAP_LINEAR
 * @internal
 */
export const GL_NEAREST_MIPMAP_LINEAR = 0x2702;

/**
 * WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
 * @internal
 */
export const GL_LINEAR_MIPMAP_LINEAR = 0x2703;

/**
 * WebGLRenderingContext.TEXTURE_MAG_FILTER
 * @internal
 */
export const GL_TEXTURE_MAG_FILTER = 0x2800;

/**
 * WebGLRenderingContext.TEXTURE_MIN_FILTER
 * @internal
 */
export const GL_TEXTURE_MIN_FILTER = 0x2801;

/**
 * WebGLRenderingContext.TEXTURE_WRAP_S
 * @internal
 */
export const GL_TEXTURE_WRAP_S = 0x2802;

/**
 * WebGLRenderingContext.TEXTURE_WRAP_T
 * @internal
 */
export const GL_TEXTURE_WRAP_T = 0x2803;

/**
 * WebGLRenderingContext.TEXTURE_2D
 * @internal
 */
export const GL_TEXTURE_2D = 0x0DE1;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP = 0x8513;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_X
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_X
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Y
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Y
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_POSITIVE_Z
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;

/**
 * WebGLRenderingContext.TEXTURE_CUBE_MAP_NEGATIVE_Z
 * @internal
 */
export const GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;

/**
 * WebGLRenderingContext.TEXTURE0
 * @internal
 */
export const GL_TEXTURE0 = 0x84C0;

/**
 * WebGLRenderingContext.REPEAT
 * @internal
 */
export const GL_REPEAT = 0x2901;

/**
 * WebGLRenderingContext.CLAMP_TO_EDGE
 * @internal
 */
export const GL_CLAMP_TO_EDGE = 0x812F;

/**
 * WebGLRenderingContext.MIRRORED_REPEAT
 * @internal
 */
export const GL_MIRRORED_REPEAT = 0x8370;

// Uniform types

/**
 * WebGLRenderingContext.FLOAT_VEC2
 * @internal
 */
export const GL_FLOAT_VEC2 = 0x8B50;

/**
 * WebGLRenderingContext.FLOAT_VEC3
 * @internal
 */
export const GL_FLOAT_VEC3 = 0x8B51;

/**
 * WebGLRenderingContext.FLOAT_VEC4
 * @internal
 */
export const GL_FLOAT_VEC4 = 0x8B52;

/**
 * WebGLRenderingContext.INT_VEC2
 * @internal
 */
export const GL_INT_VEC2 = 0x8B53;

/**
 * WebGLRenderingContext.INT_VEC3
 * @internal
 */
export const GL_INT_VEC3 = 0x8B54;

/**
 * WebGLRenderingContext.INT_VEC4
 * @internal
 */
export const GL_INT_VEC4 = 0x8B55;

/**
 * WebGLRenderingContext.BOOL
 * @internal
 */
export const GL_BOOL = 0x8B56;

/**
 * WebGLRenderingContext.BOOL_VEC2
 * @internal
 */
export const GL_BOOL_VEC2 = 0x8B57;

/**
 * WebGLRenderingContext.BOOL_VEC3
 * @internal
 */
export const GL_BOOL_VEC3 = 0x8B58;

/**
 * WebGLRenderingContext.BOOL_VEC4
 * @internal
 */
export const GL_BOOL_VEC4 = 0x8B59;

/**
 * WebGLRenderingContext.FLOAT_MAT2
 * @internal
 */
export const GL_FLOAT_MAT2 = 0x8B5A;

/**
 * WebGLRenderingContext.FLOAT_MAT3
 * @internal
 */
export const GL_FLOAT_MAT3 = 0x8B5B;

/**
 * WebGLRenderingContext.FLOAT_MAT4
 * @internal
 */
export const GL_FLOAT_MAT4 = 0x8B5C;

/**
 * WebGLRenderingContext.SAMPLER_2D
 * @internal
 */
export const GL_SAMPLER_2D = 0x8B5E;
 
/**
 * WebGLRenderingContext.SAMPLER_CUBE
 * @internal
 */
export const GL_SAMPLER_CUBE = 0x8B60;

// Framebuffers and renderbuffers

/**
 * WebGLRenderingContext.FRAMEBUFFER
 * @internal
 */
export const GL_FRAMEBUFFER = 0x8D40;

/**
 * WebGLRenderingContext.RENDERBUFFER
 * @internal
 */
export const GL_RENDERBUFFER = 0x8D41;

/**
 * WebGLRenderingContext.DEPTH_COMPONENT16
 * @internal
 */
export const GL_DEPTH_COMPONENT16 = 0x81A5;

/**
 * WebGLRenderingContext.STENCIL_INDEX8
 * @internal
 */
export const GL_STENCIL_INDEX8 = 0x8D48;

/**
 * WebGLRenderingContext.DEPTH_STENCIL
 * @internal
 */
export const GL_DEPTH_STENCIL = 0x84F9;

/**
 * WebGLRenderingContext.COLOR_ATTACHMENT0
 * @internal
 */
export const GL_COLOR_ATTACHMENT0 = 0x8CE0;

/**
 * WebGLRenderingContext.DEPTH_ATTACHMENT
 * @internal
 */
export const GL_DEPTH_ATTACHMENT = 0x8D00;

/**
 * WebGLRenderingContext.STENCIL_ATTACHMENT
 * @internal
 */
export const GL_STENCIL_ATTACHMENT = 0x8D20;

/**
 * WebGLRenderingContext.DEPTH_STENCIL_ATTACHMENT
 * @internal
 */
export const GL_DEPTH_STENCIL_ATTACHMENT = 0x821A;

/**
 * WebGLRenderingContext.FRAMEBUFFER_COMPLETE
 * @internal
 */
export const GL_FRAMEBUFFER_COMPLETE = 0x8CD5;

// EXT_blend_minmax

/**
 * EXT_blend_minmax.MIN_EXT
 * WebGL2RenderingContext.MIN
 * @internal
 */
export const GL_MIN_EXT = 0x8007;

/**
 * EXT_blend_minmax.MAX_EXT
 * WebGL2RenderingContext.MAX
 * @internal
 */
export const GL_MAX_EXT = 0x8008;

// EXT_texture_filter_anisotropic

/**
 * EXT_texture_filter_anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT
 * @internal
 */
export const GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

/**
 * EXT_texture_filter_anisotropic.TEXTURE_MAX_ANISOTROPY_EXT
 * @internal
 */
export const GL_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;

// WEBGL_depth_texture

/**
 * WEBGL_depth_texture.UNSIGNED_INT_24_8_WEBGL
 * @internal
 */
export const GL_UNSIGNED_INT_24_8_WEBGL = 0x84FA;

// OES_texture_half_float

/**
 * OES_texture_half_float.HALF_FLOAT_OES
 * @internal
 */
export const GL_HALF_FLOAT_OES = 0x8D61;

// WebGL2 Constants

// Textures

/**
 * WebGL2RenderingContext.RED
 * @internal
 */
export const GL_RED = 0x1903;

/**
 * WebGL2RenderingContext.RGBA8
 * @internal
 */
export const GL_RGBA8 = 0x8058;

/**
 * WebGL2RenderingContext.TEXTURE_3D
 * @internal
 */
export const GL_TEXTURE_3D = 0x806F;

/**
 * WebGL2RenderingContext.TEXTURE_WRAP_R
 * @internal
 */
export const GL_TEXTURE_WRAP_R = 0x8072;

/**
 * WebGL2RenderingContext.TEXTURE_MIN_LOD
 * @internal
 */
export const GL_TEXTURE_MIN_LOD = 0x813A;

/**
 * WebGL2RenderingContext.TEXTURE_MAX_LOD
 * @internal
 */
export const GL_TEXTURE_MAX_LOD = 0x813B;

/**
 * WebGL2RenderingContext.RGBA32F
 * @internal
 */
export const GL_RGBA32F = 0x8814;

/**
 * WebGL2RenderingContext.RGBA16F
 * @internal
 */
export const GL_RGBA16F = 0x881A;

/**
 * WebGL2RenderingContext.TEXTURE_2D_ARRAY
 * @internal
 */
export const GL_TEXTURE_2D_ARRAY = 0x8C1A;

/**
 * WebGL2RenderingContext.R16F
 * @internal
 */
export const GL_R16F = 0x822D;

/**
 * WebGL2RenderingContext.R32F
 * @internal
 */
export const GL_R32F = 0x822E;

/**
 * WebGL2RenderingContext.RG16F
 * @internal
 */
export const GL_RG16F = 0x822F;

/**
 * WebGL2RenderingContext.RG32F
 * @internal
 */
export const GL_RG32F = 0x8230;

// Pixel types

/**
 * WebGL2RenderingContext.HALF_FLOAT
 * @internal
 */
export const GL_HALF_FLOAT = 0x140B;

/**
 * WebGL2RenderingContext.RG
 * @internal
 */
export const GL_RG = 0x8227;

// Samplers

/**
 * WebGL2RenderingContext.SAMPLER_3D
 * @internal
 */
export const GL_SAMPLER_3D = 0x8B5F;

/**
 * WebGL2RenderingContext.SAMPLER_2D_ARRAY
 * @internal
 */
export const GL_SAMPLER_2D_ARRAY = 0x8DC1;

// Framebuffers and renderbuffers

/**
 * WebGL2RenderingContext.READ_FRAMEBUFFER
 * @internal
 */
export const GL_READ_FRAMEBUFFER = 0x8CA8;

/**
 * WebGL2RenderingContext.DRAW_FRAMEBUFFER
 * @internal
 */
export const GL_DRAW_FRAMEBUFFER = 0x8CA9;

/**
 * WebGL2RenderingContext.UNIFORM_BUFFER
 * @internal
 */
 export const GL_UNIFORM_BUFFER = 0x8A11;

/**
 * WebGL2RenderingContext.INVALID_INDEX
 * @internal
 */
 export const GL_INVALID_INDEX = 0xFFFFFFFF;
