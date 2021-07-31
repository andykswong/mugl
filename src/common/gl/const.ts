/**
 * All WebGL core and extension constants.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
 * @see https://github.com/KhronosGroup/WebGL/blob/main/specs/latest/1.0/webgl.idl
 * @see https://github.com/KhronosGroup/WebGL/blob/main/specs/latest/2.0/webgl.idl
 * @see https://github.com/KhronosGroup/WebGL/tree/main/extensions
 * @packageDocumentation
 */

/* WebGL 1.0 constants */

/* ClearBufferMask */
export const DEPTH_BUFFER_BIT = 0x00000100;
export const STENCIL_BUFFER_BIT = 0x00000400;
export const COLOR_BUFFER_BIT = 0x00004000;

/* BeginMode */
export const POINTS = 0x0000;
export const LINES = 0x0001;
export const LINE_LOOP = 0x0002;
export const LINE_STRIP = 0x0003;
export const TRIANGLES = 0x0004;
export const TRIANGLE_STRIP = 0x0005;
export const TRIANGLE_FAN = 0x0006;

/* AlphaFunction (not supported in ES20) */
/*      NEVER */
/*      LESS */
/*      EQUAL */
/*      LEQUAL */
/*      GREATER */
/*      NOTEQUAL */
/*      GEQUAL */
/*      ALWAYS */

/* BlendingFactorDest */
export const ZERO = 0;
export const ONE = 1;
export const SRC_COLOR = 0x0300;
export const ONE_MINUS_SRC_COLOR = 0x0301;
export const SRC_ALPHA = 0x0302;
export const ONE_MINUS_SRC_ALPHA = 0x0303;
export const DST_ALPHA = 0x0304;
export const ONE_MINUS_DST_ALPHA = 0x0305;

/* BlendingFactorSrc */
/*      ZERO */
/*      ONE */
export const DST_COLOR = 0x0306;
export const ONE_MINUS_DST_COLOR = 0x0307;
export const SRC_ALPHA_SATURATE = 0x0308;
/*      SRC_ALPHA */
/*      ONE_MINUS_SRC_ALPHA */
/*      DST_ALPHA */
/*      ONE_MINUS_DST_ALPHA */

/* BlendEquationSeparate */
export const FUNC_ADD = 0x8006;
export const BLEND_EQUATION = 0x8009;
export const BLEND_EQUATION_RGB = 0x8009;   /* same as BLEND_EQUATION */
export const BLEND_EQUATION_ALPHA = 0x883D;

/* BlendSubtract */
export const FUNC_SUBTRACT = 0x800A;
export const FUNC_REVERSE_SUBTRACT = 0x800B;

/* Separate Blend Functions */
export const BLEND_DST_RGB = 0x80C8;
export const BLEND_SRC_RGB = 0x80C9;
export const BLEND_DST_ALPHA = 0x80CA;
export const BLEND_SRC_ALPHA = 0x80CB;
export const CONSTANT_COLOR = 0x8001;
export const ONE_MINUS_CONSTANT_COLOR = 0x8002;
export const CONSTANT_ALPHA = 0x8003;
export const ONE_MINUS_CONSTANT_ALPHA = 0x8004;
export const BLEND_COLOR = 0x8005;

/* Buffer Objects */
export const ARRAY_BUFFER = 0x8892;
export const ELEMENT_ARRAY_BUFFER = 0x8893;
export const ARRAY_BUFFER_BINDING = 0x8894;
export const ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

export const STREAM_DRAW = 0x88E0;
export const STATIC_DRAW = 0x88E4;
export const DYNAMIC_DRAW = 0x88E8;

export const BUFFER_SIZE = 0x8764;
export const BUFFER_USAGE = 0x8765;

export const CURRENT_VERTEX_ATTRIB = 0x8626;

/* CullFaceMode */
export const FRONT = 0x0404;
export const BACK = 0x0405;
export const FRONT_AND_BACK = 0x0408;

/* DepthFunction */
/*      NEVER */
/*      LESS */
/*      EQUAL */
/*      LEQUAL */
/*      GREATER */
/*      NOTEQUAL */
/*      GEQUAL */
/*      ALWAYS */

/* EnableCap */
/* TEXTURE_2D */
export const CULL_FACE = 0x0B44;
export const BLEND = 0x0BE2;
export const DITHER = 0x0BD0;
export const STENCIL_TEST = 0x0B90;
export const DEPTH_TEST = 0x0B71;
export const SCISSOR_TEST = 0x0C11;
export const POLYGON_OFFSET_FILL = 0x8037;
export const SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
export const SAMPLE_COVERAGE = 0x80A0;

/* ErrorCode */
export const NO_ERROR = 0;
export const INVALID_ENUM = 0x0500;
export const INVALID_VALUE = 0x0501;
export const INVALID_OPERATION = 0x0502;
export const OUT_OF_MEMORY = 0x0505;

/* FrontFaceDirection */
export const CW = 0x0900;
export const CCW = 0x0901;

/* GetPName */
export const LINE_WIDTH = 0x0B21;
export const ALIASED_POINT_SIZE_RANGE = 0x846D;
export const ALIASED_LINE_WIDTH_RANGE = 0x846E;
export const CULL_FACE_MODE = 0x0B45;
export const FRONT_FACE = 0x0B46;
export const DEPTH_RANGE = 0x0B70;
export const DEPTH_WRITEMASK = 0x0B72;
export const DEPTH_CLEAR_VALUE = 0x0B73;
export const DEPTH_FUNC = 0x0B74;
export const STENCIL_CLEAR_VALUE = 0x0B91;
export const STENCIL_FUNC = 0x0B92;
export const STENCIL_FAIL = 0x0B94;
export const STENCIL_PASS_DEPTH_FAIL = 0x0B95;
export const STENCIL_PASS_DEPTH_PASS = 0x0B96;
export const STENCIL_REF = 0x0B97;
export const STENCIL_VALUE_MASK = 0x0B93;
export const STENCIL_WRITEMASK = 0x0B98;
export const STENCIL_BACK_FUNC = 0x8800;
export const STENCIL_BACK_FAIL = 0x8801;
export const STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
export const STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
export const STENCIL_BACK_REF = 0x8CA3;
export const STENCIL_BACK_VALUE_MASK = 0x8CA4;
export const STENCIL_BACK_WRITEMASK = 0x8CA5;
export const VIEWPORT = 0x0BA2;
export const SCISSOR_BOX = 0x0C10;
/*      SCISSOR_TEST */
export const COLOR_CLEAR_VALUE = 0x0C22;
export const COLOR_WRITEMASK = 0x0C23;
export const UNPACK_ALIGNMENT = 0x0CF5;
export const PACK_ALIGNMENT = 0x0D05;
export const MAX_TEXTURE_SIZE = 0x0D33;
export const MAX_VIEWPORT_DIMS = 0x0D3A;
export const SUBPIXEL_BITS = 0x0D50;
export const RED_BITS = 0x0D52;
export const GREEN_BITS = 0x0D53;
export const BLUE_BITS = 0x0D54;
export const ALPHA_BITS = 0x0D55;
export const DEPTH_BITS = 0x0D56;
export const STENCIL_BITS = 0x0D57;
export const POLYGON_OFFSET_UNITS = 0x2A00;
/*      POLYGON_OFFSET_FILL */
export const POLYGON_OFFSET_FACTOR = 0x8038;
export const TEXTURE_BINDING_2D = 0x8069;
export const SAMPLE_BUFFERS = 0x80A8;
export const SAMPLES = 0x80A9;
export const SAMPLE_COVERAGE_VALUE = 0x80AA;
export const SAMPLE_COVERAGE_INVERT = 0x80AB;

/* GetTextureParameter */
/*      TEXTURE_MAG_FILTER */
/*      TEXTURE_MIN_FILTER */
/*      TEXTURE_WRAP_S */
/*      TEXTURE_WRAP_T */

export const COMPRESSED_TEXTURE_FORMATS = 0x86A3;

/* HintMode */
export const DONT_CARE = 0x1100;
export const FASTEST = 0x1101;
export const NICEST = 0x1102;

/* HintTarget */
export const GENERATE_MIPMAP_HINT = 0x8192;

/* DataType */
export const BYTE = 0x1400;
export const UNSIGNED_BYTE = 0x1401;
export const SHORT = 0x1402;
export const UNSIGNED_SHORT = 0x1403;
export const INT = 0x1404;
export const UNSIGNED_INT = 0x1405;
export const FLOAT = 0x1406;

/* PixelFormat */
export const DEPTH_COMPONENT = 0x1902;
export const ALPHA = 0x1906;
export const RGB = 0x1907;
export const RGBA = 0x1908;
export const LUMINANCE = 0x1909;
export const LUMINANCE_ALPHA = 0x190A;

/* PixelType */
/*      UNSIGNED_BYTE */
export const UNSIGNED_SHORT_4_4_4_4 = 0x8033;
export const UNSIGNED_SHORT_5_5_5_1 = 0x8034;
export const UNSIGNED_SHORT_5_6_5 = 0x8363;

/* Shaders */
export const FRAGMENT_SHADER = 0x8B30;
export const VERTEX_SHADER = 0x8B31;
export const MAX_VERTEX_ATTRIBS = 0x8869;
export const MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
export const MAX_VARYING_VECTORS = 0x8DFC;
export const MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
export const MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
export const MAX_TEXTURE_IMAGE_UNITS = 0x8872;
export const MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
export const SHADER_TYPE = 0x8B4F;
export const DELETE_STATUS = 0x8B80;
export const LINK_STATUS = 0x8B82;
export const VALIDATE_STATUS = 0x8B83;
export const ATTACHED_SHADERS = 0x8B85;
export const ACTIVE_UNIFORMS = 0x8B86;
export const ACTIVE_ATTRIBUTES = 0x8B89;
export const SHADING_LANGUAGE_VERSION = 0x8B8C;
export const CURRENT_PROGRAM = 0x8B8D;

/* StencilFunction */
export const NEVER = 0x0200;
export const LESS = 0x0201;
export const EQUAL = 0x0202;
export const LEQUAL = 0x0203;
export const GREATER = 0x0204;
export const NOTEQUAL = 0x0205;
export const GEQUAL = 0x0206;
export const ALWAYS = 0x0207;

/* StencilOp */
/*      ZERO */
export const KEEP = 0x1E00;
export const REPLACE = 0x1E01;
export const INCR = 0x1E02;
export const DECR = 0x1E03;
export const INVERT = 0x150A;
export const INCR_WRAP = 0x8507;
export const DECR_WRAP = 0x8508;

/* StringName */
export const VENDOR = 0x1F00;
export const RENDERER = 0x1F01;
export const VERSION = 0x1F02;

/* TextureMagFilter */
export const NEAREST = 0x2600;
export const LINEAR = 0x2601;

/* TextureMinFilter */
/*      NEAREST */
/*      LINEAR */
export const NEAREST_MIPMAP_NEAREST = 0x2700;
export const LINEAR_MIPMAP_NEAREST = 0x2701;
export const NEAREST_MIPMAP_LINEAR = 0x2702;
export const LINEAR_MIPMAP_LINEAR = 0x2703;

/* TextureParameterName */
export const TEXTURE_MAG_FILTER = 0x2800;
export const TEXTURE_MIN_FILTER = 0x2801;
export const TEXTURE_WRAP_S = 0x2802;
export const TEXTURE_WRAP_T = 0x2803;

/* TextureTarget */
export const TEXTURE_2D = 0x0DE1;
export const TEXTURE = 0x1702;

export const TEXTURE_CUBE_MAP = 0x8513;
export const TEXTURE_BINDING_CUBE_MAP = 0x8514;
export const TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
export const TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
export const TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
export const TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
export const TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
export const TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
export const MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

/* TextureUnit */
export const TEXTURE0 = 0x84C0;
export const TEXTURE1 = 0x84C1;
export const TEXTURE2 = 0x84C2;
export const TEXTURE3 = 0x84C3;
export const TEXTURE4 = 0x84C4;
export const TEXTURE5 = 0x84C5;
export const TEXTURE6 = 0x84C6;
export const TEXTURE7 = 0x84C7;
export const TEXTURE8 = 0x84C8;
export const TEXTURE9 = 0x84C9;
export const TEXTURE10 = 0x84CA;
export const TEXTURE11 = 0x84CB;
export const TEXTURE12 = 0x84CC;
export const TEXTURE13 = 0x84CD;
export const TEXTURE14 = 0x84CE;
export const TEXTURE15 = 0x84CF;
export const TEXTURE16 = 0x84D0;
export const TEXTURE17 = 0x84D1;
export const TEXTURE18 = 0x84D2;
export const TEXTURE19 = 0x84D3;
export const TEXTURE20 = 0x84D4;
export const TEXTURE21 = 0x84D5;
export const TEXTURE22 = 0x84D6;
export const TEXTURE23 = 0x84D7;
export const TEXTURE24 = 0x84D8;
export const TEXTURE25 = 0x84D9;
export const TEXTURE26 = 0x84DA;
export const TEXTURE27 = 0x84DB;
export const TEXTURE28 = 0x84DC;
export const TEXTURE29 = 0x84DD;
export const TEXTURE30 = 0x84DE;
export const TEXTURE31 = 0x84DF;
export const ACTIVE_TEXTURE = 0x84E0;

/* TextureWrapMode */
export const REPEAT = 0x2901;
export const CLAMP_TO_EDGE = 0x812F;
export const MIRRORED_REPEAT = 0x8370;

/* Uniform Types */
export const FLOAT_VEC2 = 0x8B50;
export const FLOAT_VEC3 = 0x8B51;
export const FLOAT_VEC4 = 0x8B52;
export const INT_VEC2 = 0x8B53;
export const INT_VEC3 = 0x8B54;
export const INT_VEC4 = 0x8B55;
export const BOOL = 0x8B56;
export const BOOL_VEC2 = 0x8B57;
export const BOOL_VEC3 = 0x8B58;
export const BOOL_VEC4 = 0x8B59;
export const FLOAT_MAT2 = 0x8B5A;
export const FLOAT_MAT3 = 0x8B5B;
export const FLOAT_MAT4 = 0x8B5C;
export const SAMPLER_2D = 0x8B5E;
export const SAMPLER_CUBE = 0x8B60;

/* Vertex Arrays */
export const VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
export const VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
export const VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
export const VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
export const VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
export const VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
export const VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

/* Read Format */
export const IMPLEMENTATION_COLOR_READ_TYPE = 0x8B9A;
export const IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

/* Shader Source */
export const COMPILE_STATUS = 0x8B81;

/* Shader Precision-Specified Types */
export const LOW_FLOAT = 0x8DF0;
export const MEDIUM_FLOAT = 0x8DF1;
export const HIGH_FLOAT = 0x8DF2;
export const LOW_INT = 0x8DF3;
export const MEDIUM_INT = 0x8DF4;
export const HIGH_INT = 0x8DF5;

/* Framebuffer Object. */
export const FRAMEBUFFER = 0x8D40;
export const RENDERBUFFER = 0x8D41;

export const RGBA4 = 0x8056;
export const RGB5_A1 = 0x8057;
export const RGB565 = 0x8D62;
export const DEPTH_COMPONENT16 = 0x81A5;
export const STENCIL_INDEX = 0x1901;
export const STENCIL_INDEX8 = 0x8D48;
export const DEPTH_STENCIL = 0x84F9;

export const RENDERBUFFER_WIDTH = 0x8D42;
export const RENDERBUFFER_HEIGHT = 0x8D43;
export const RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
export const RENDERBUFFER_RED_SIZE = 0x8D50;
export const RENDERBUFFER_GREEN_SIZE = 0x8D51;
export const RENDERBUFFER_BLUE_SIZE = 0x8D52;
export const RENDERBUFFER_ALPHA_SIZE = 0x8D53;
export const RENDERBUFFER_DEPTH_SIZE = 0x8D54;
export const RENDERBUFFER_STENCIL_SIZE = 0x8D55;

export const FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
export const FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

export const COLOR_ATTACHMENT0 = 0x8CE0;
export const DEPTH_ATTACHMENT = 0x8D00;
export const STENCIL_ATTACHMENT = 0x8D20;
export const DEPTH_STENCIL_ATTACHMENT = 0x821A;

export const NONE = 0;

export const FRAMEBUFFER_COMPLETE = 0x8CD5;
export const FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
export const FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
export const FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
export const FRAMEBUFFER_UNSUPPORTED = 0x8CDD;

export const FRAMEBUFFER_BINDING = 0x8CA6;
export const RENDERBUFFER_BINDING = 0x8CA7;
export const MAX_RENDERBUFFER_SIZE = 0x84E8;

export const INVALID_FRAMEBUFFER_OPERATION = 0x0506;

/* WebGL-specific enums */
export const UNPACK_FLIP_Y_WEBGL = 0x9240;
export const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
export const CONTEXT_LOST_WEBGL = 0x9242;
export const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
export const BROWSER_DEFAULT_WEBGL = 0x9244;

/* WebGL 2.0 constants */

export const READ_BUFFER = 0x0C02;
export const UNPACK_ROW_LENGTH = 0x0CF2;
export const UNPACK_SKIP_ROWS = 0x0CF3;
export const UNPACK_SKIP_PIXELS = 0x0CF4;
export const PACK_ROW_LENGTH = 0x0D02;
export const PACK_SKIP_ROWS = 0x0D03;
export const PACK_SKIP_PIXELS = 0x0D04;
export const COLOR = 0x1800;
export const DEPTH = 0x1801;
export const STENCIL = 0x1802;
export const RED = 0x1903;
export const RGB8 = 0x8051;
export const RGBA8 = 0x8058;
export const RGB10_A2 = 0x8059;
export const TEXTURE_BINDING_3D = 0x806A;
export const UNPACK_SKIP_IMAGES = 0x806D;
export const UNPACK_IMAGE_HEIGHT = 0x806E;
export const TEXTURE_3D = 0x806F;
export const TEXTURE_WRAP_R = 0x8072;
export const MAX_3D_TEXTURE_SIZE = 0x8073;
export const UNSIGNED_INT_2_10_10_10_REV = 0x8368;
export const MAX_ELEMENTS_VERTICES = 0x80E8;
export const MAX_ELEMENTS_INDICES = 0x80E9;
export const TEXTURE_MIN_LOD = 0x813A;
export const TEXTURE_MAX_LOD = 0x813B;
export const TEXTURE_BASE_LEVEL = 0x813C;
export const TEXTURE_MAX_LEVEL = 0x813D;
export const MIN = 0x8007;
export const MAX = 0x8008;
export const DEPTH_COMPONENT24 = 0x81A6;
export const MAX_TEXTURE_LOD_BIAS = 0x84FD;
export const TEXTURE_COMPARE_MODE = 0x884C;
export const TEXTURE_COMPARE_FUNC = 0x884D;
export const CURRENT_QUERY = 0x8865;
export const QUERY_RESULT = 0x8866;
export const QUERY_RESULT_AVAILABLE = 0x8867;
export const STREAM_READ = 0x88E1;
export const STREAM_COPY = 0x88E2;
export const STATIC_READ = 0x88E5;
export const STATIC_COPY = 0x88E6;
export const DYNAMIC_READ = 0x88E9;
export const DYNAMIC_COPY = 0x88EA;
export const MAX_DRAW_BUFFERS = 0x8824;
export const DRAW_BUFFER0 = 0x8825;
export const DRAW_BUFFER1 = 0x8826;
export const DRAW_BUFFER2 = 0x8827;
export const DRAW_BUFFER3 = 0x8828;
export const DRAW_BUFFER4 = 0x8829;
export const DRAW_BUFFER5 = 0x882A;
export const DRAW_BUFFER6 = 0x882B;
export const DRAW_BUFFER7 = 0x882C;
export const DRAW_BUFFER8 = 0x882D;
export const DRAW_BUFFER9 = 0x882E;
export const DRAW_BUFFER10 = 0x882F;
export const DRAW_BUFFER11 = 0x8830;
export const DRAW_BUFFER12 = 0x8831;
export const DRAW_BUFFER13 = 0x8832;
export const DRAW_BUFFER14 = 0x8833;
export const DRAW_BUFFER15 = 0x8834;
export const MAX_FRAGMENT_UNIFORM_COMPONENTS = 0x8B49;
export const MAX_VERTEX_UNIFORM_COMPONENTS = 0x8B4A;
export const SAMPLER_3D = 0x8B5F;
export const SAMPLER_2D_SHADOW = 0x8B62;
export const FRAGMENT_SHADER_DERIVATIVE_HINT = 0x8B8B;
export const PIXEL_PACK_BUFFER = 0x88EB;
export const PIXEL_UNPACK_BUFFER = 0x88EC;
export const PIXEL_PACK_BUFFER_BINDING = 0x88ED;
export const PIXEL_UNPACK_BUFFER_BINDING = 0x88EF;
export const FLOAT_MAT2x3 = 0x8B65;
export const FLOAT_MAT2x4 = 0x8B66;
export const FLOAT_MAT3x2 = 0x8B67;
export const FLOAT_MAT3x4 = 0x8B68;
export const FLOAT_MAT4x2 = 0x8B69;
export const FLOAT_MAT4x3 = 0x8B6A;
export const SRGB = 0x8C40;
export const SRGB8 = 0x8C41;
export const SRGB8_ALPHA8 = 0x8C43;
export const COMPARE_REF_TO_TEXTURE = 0x884E;
export const RGBA32F = 0x8814;
export const RGB32F = 0x8815;
export const RGBA16F = 0x881A;
export const RGB16F = 0x881B;
export const VERTEX_ATTRIB_ARRAY_INTEGER = 0x88FD;
export const MAX_ARRAY_TEXTURE_LAYERS = 0x88FF;
export const MIN_PROGRAM_TEXEL_OFFSET = 0x8904;
export const MAX_PROGRAM_TEXEL_OFFSET = 0x8905;
export const MAX_VARYING_COMPONENTS = 0x8B4B;
export const TEXTURE_2D_ARRAY = 0x8C1A;
export const TEXTURE_BINDING_2D_ARRAY = 0x8C1D;
export const R11F_G11F_B10F = 0x8C3A;
export const UNSIGNED_INT_10F_11F_11F_REV = 0x8C3B;
export const RGB9_E5 = 0x8C3D;
export const UNSIGNED_INT_5_9_9_9_REV = 0x8C3E;
export const TRANSFORM_FEEDBACK_BUFFER_MODE = 0x8C7F;
export const MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = 0x8C80;
export const TRANSFORM_FEEDBACK_VARYINGS = 0x8C83;
export const TRANSFORM_FEEDBACK_BUFFER_START = 0x8C84;
export const TRANSFORM_FEEDBACK_BUFFER_SIZE = 0x8C85;
export const TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN = 0x8C88;
export const RASTERIZER_DISCARD = 0x8C89;
export const MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = 0x8C8A;
export const MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = 0x8C8B;
export const INTERLEAVED_ATTRIBS = 0x8C8C;
export const SEPARATE_ATTRIBS = 0x8C8D;
export const TRANSFORM_FEEDBACK_BUFFER = 0x8C8E;
export const TRANSFORM_FEEDBACK_BUFFER_BINDING = 0x8C8F;
export const RGBA32UI = 0x8D70;
export const RGB32UI = 0x8D71;
export const RGBA16UI = 0x8D76;
export const RGB16UI = 0x8D77;
export const RGBA8UI = 0x8D7C;
export const RGB8UI = 0x8D7D;
export const RGBA32I = 0x8D82;
export const RGB32I = 0x8D83;
export const RGBA16I = 0x8D88;
export const RGB16I = 0x8D89;
export const RGBA8I = 0x8D8E;
export const RGB8I = 0x8D8F;
export const RED_INTEGER = 0x8D94;
export const RGB_INTEGER = 0x8D98;
export const RGBA_INTEGER = 0x8D99;
export const SAMPLER_2D_ARRAY = 0x8DC1;
export const SAMPLER_2D_ARRAY_SHADOW = 0x8DC4;
export const SAMPLER_CUBE_SHADOW = 0x8DC5;
export const UNSIGNED_INT_VEC2 = 0x8DC6;
export const UNSIGNED_INT_VEC3 = 0x8DC7;
export const UNSIGNED_INT_VEC4 = 0x8DC8;
export const INT_SAMPLER_2D = 0x8DCA;
export const INT_SAMPLER_3D = 0x8DCB;
export const INT_SAMPLER_CUBE = 0x8DCC;
export const INT_SAMPLER_2D_ARRAY = 0x8DCF;
export const UNSIGNED_INT_SAMPLER_2D = 0x8DD2;
export const UNSIGNED_INT_SAMPLER_3D = 0x8DD3;
export const UNSIGNED_INT_SAMPLER_CUBE = 0x8DD4;
export const UNSIGNED_INT_SAMPLER_2D_ARRAY = 0x8DD7;
export const DEPTH_COMPONENT32F = 0x8CAC;
export const DEPTH32F_STENCIL8 = 0x8CAD;
export const FLOAT_32_UNSIGNED_INT_24_8_REV = 0x8DAD;
export const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = 0x8210;
export const FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE = 0x8211;
export const FRAMEBUFFER_ATTACHMENT_RED_SIZE = 0x8212;
export const FRAMEBUFFER_ATTACHMENT_GREEN_SIZE = 0x8213;
export const FRAMEBUFFER_ATTACHMENT_BLUE_SIZE = 0x8214;
export const FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE = 0x8215;
export const FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE = 0x8216;
export const FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE = 0x8217;
export const FRAMEBUFFER_DEFAULT = 0x8218;
export const UNSIGNED_INT_24_8 = 0x84FA;
export const DEPTH24_STENCIL8 = 0x88F0;
export const UNSIGNED_NORMALIZED = 0x8C17;
export const DRAW_FRAMEBUFFER_BINDING = 0x8CA6; /* Same as FRAMEBUFFER_BINDING */
export const READ_FRAMEBUFFER = 0x8CA8;
export const DRAW_FRAMEBUFFER = 0x8CA9;
export const READ_FRAMEBUFFER_BINDING = 0x8CAA;
export const RENDERBUFFER_SAMPLES = 0x8CAB;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER = 0x8CD4;
export const MAX_COLOR_ATTACHMENTS = 0x8CDF;
export const COLOR_ATTACHMENT1 = 0x8CE1;
export const COLOR_ATTACHMENT2 = 0x8CE2;
export const COLOR_ATTACHMENT3 = 0x8CE3;
export const COLOR_ATTACHMENT4 = 0x8CE4;
export const COLOR_ATTACHMENT5 = 0x8CE5;
export const COLOR_ATTACHMENT6 = 0x8CE6;
export const COLOR_ATTACHMENT7 = 0x8CE7;
export const COLOR_ATTACHMENT8 = 0x8CE8;
export const COLOR_ATTACHMENT9 = 0x8CE9;
export const COLOR_ATTACHMENT10 = 0x8CEA;
export const COLOR_ATTACHMENT11 = 0x8CEB;
export const COLOR_ATTACHMENT12 = 0x8CEC;
export const COLOR_ATTACHMENT13 = 0x8CED;
export const COLOR_ATTACHMENT14 = 0x8CEE;
export const COLOR_ATTACHMENT15 = 0x8CEF;
export const FRAMEBUFFER_INCOMPLETE_MULTISAMPLE = 0x8D56;
export const MAX_SAMPLES = 0x8D57;
export const HALF_FLOAT = 0x140B;
export const RG = 0x8227;
export const RG_INTEGER = 0x8228;
export const R8 = 0x8229;
export const RG8 = 0x822B;
export const R16F = 0x822D;
export const R32F = 0x822E;
export const RG16F = 0x822F;
export const RG32F = 0x8230;
export const R8I = 0x8231;
export const R8UI = 0x8232;
export const R16I = 0x8233;
export const R16UI = 0x8234;
export const R32I = 0x8235;
export const R32UI = 0x8236;
export const RG8I = 0x8237;
export const RG8UI = 0x8238;
export const RG16I = 0x8239;
export const RG16UI = 0x823A;
export const RG32I = 0x823B;
export const RG32UI = 0x823C;
export const VERTEX_ARRAY_BINDING = 0x85B5;
export const R8_SNORM = 0x8F94;
export const RG8_SNORM = 0x8F95;
export const RGB8_SNORM = 0x8F96;
export const RGBA8_SNORM = 0x8F97;
export const SIGNED_NORMALIZED = 0x8F9C;
export const COPY_READ_BUFFER = 0x8F36;
export const COPY_WRITE_BUFFER = 0x8F37;
export const COPY_READ_BUFFER_BINDING = 0x8F36; /* Same as COPY_READ_BUFFER */
export const COPY_WRITE_BUFFER_BINDING = 0x8F37; /* Same as COPY_WRITE_BUFFER */
export const UNIFORM_BUFFER = 0x8A11;
export const UNIFORM_BUFFER_BINDING = 0x8A28;
export const UNIFORM_BUFFER_START = 0x8A29;
export const UNIFORM_BUFFER_SIZE = 0x8A2A;
export const MAX_VERTEX_UNIFORM_BLOCKS = 0x8A2B;
export const MAX_FRAGMENT_UNIFORM_BLOCKS = 0x8A2D;
export const MAX_COMBINED_UNIFORM_BLOCKS = 0x8A2E;
export const MAX_UNIFORM_BUFFER_BINDINGS = 0x8A2F;
export const MAX_UNIFORM_BLOCK_SIZE = 0x8A30;
export const MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = 0x8A31;
export const MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = 0x8A33;
export const UNIFORM_BUFFER_OFFSET_ALIGNMENT = 0x8A34;
export const ACTIVE_UNIFORM_BLOCKS = 0x8A36;
export const UNIFORM_TYPE = 0x8A37;
export const UNIFORM_SIZE = 0x8A38;
export const UNIFORM_BLOCK_INDEX = 0x8A3A;
export const UNIFORM_OFFSET = 0x8A3B;
export const UNIFORM_ARRAY_STRIDE = 0x8A3C;
export const UNIFORM_MATRIX_STRIDE = 0x8A3D;
export const UNIFORM_IS_ROW_MAJOR = 0x8A3E;
export const UNIFORM_BLOCK_BINDING = 0x8A3F;
export const UNIFORM_BLOCK_DATA_SIZE = 0x8A40;
export const UNIFORM_BLOCK_ACTIVE_UNIFORMS = 0x8A42;
export const UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES = 0x8A43;
export const UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER = 0x8A44;
export const UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER = 0x8A46;
export const INVALID_INDEX = 0xFFFFFFFF;
export const MAX_VERTEX_OUTPUT_COMPONENTS = 0x9122;
export const MAX_FRAGMENT_INPUT_COMPONENTS = 0x9125;
export const MAX_SERVER_WAIT_TIMEOUT = 0x9111;
export const OBJECT_TYPE = 0x9112;
export const SYNC_CONDITION = 0x9113;
export const SYNC_STATUS = 0x9114;
export const SYNC_FLAGS = 0x9115;
export const SYNC_FENCE = 0x9116;
export const SYNC_GPU_COMMANDS_COMPLETE = 0x9117;
export const UNSIGNALED = 0x9118;
export const SIGNALED = 0x9119;
export const ALREADY_SIGNALED = 0x911A;
export const TIMEOUT_EXPIRED = 0x911B;
export const CONDITION_SATISFIED = 0x911C;
export const WAIT_FAILED = 0x911D;
export const SYNC_FLUSH_COMMANDS_BIT = 0x00000001;
export const VERTEX_ATTRIB_ARRAY_DIVISOR = 0x88FE;
export const ANY_SAMPLES_PASSED = 0x8C2F;
export const ANY_SAMPLES_PASSED_CONSERVATIVE = 0x8D6A;
export const SAMPLER_BINDING = 0x8919;
export const RGB10_A2UI = 0x906F;
export const INT_2_10_10_10_REV = 0x8D9F;
export const TRANSFORM_FEEDBACK = 0x8E22;
export const TRANSFORM_FEEDBACK_PAUSED = 0x8E23;
export const TRANSFORM_FEEDBACK_ACTIVE = 0x8E24;
export const TRANSFORM_FEEDBACK_BINDING = 0x8E25;
export const TEXTURE_IMMUTABLE_FORMAT = 0x912F;
export const MAX_ELEMENT_INDEX = 0x8D6B;
export const TEXTURE_IMMUTABLE_LEVELS = 0x82DF;

export const TIMEOUT_IGNORED = -1;

/* WebGL-specific enums */
export const MAX_CLIENT_WAIT_TIMEOUT_WEBGL = 0x9247;

/* WebGL extension constants */

/* ANGLE_instanced_arrays  */
export const VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE = 0x88FE;

/* EXT_blend_minmax */
export const MIN_EXT = 0x8007;
export const MAX_EXT = 0x8008;

/* EXT_clip_cull_distance */
export const MAX_CLIP_DISTANCES_EXT = 0x0D32;
export const MAX_CULL_DISTANCES_EXT = 0x82F9;
export const MAX_COMBINED_CLIP_AND_CULL_DISTANCES_EXT = 0x82FA;

export const CLIP_DISTANCE0_EXT = 0x3000;
export const CLIP_DISTANCE1_EXT = 0x3001;
export const CLIP_DISTANCE2_EXT = 0x3002;
export const CLIP_DISTANCE3_EXT = 0x3003;
export const CLIP_DISTANCE4_EXT = 0x3004;
export const CLIP_DISTANCE5_EXT = 0x3005;
export const CLIP_DISTANCE6_EXT = 0x3006;
export const CLIP_DISTANCE7_EXT = 0x3007;

/* EXT_color_buffer_half_float */
export const RGBA16F_EXT = 0x881A;
export const RGB16F_EXT = 0x881B;
export const FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT = 0x8211;
export const UNSIGNED_NORMALIZED_EXT = 0x8C17;

/* EXT_disjoint_timer_query */
export const QUERY_COUNTER_BITS_EXT = 0x8864;
export const CURRENT_QUERY_EXT = 0x8865;
export const QUERY_RESULT_EXT = 0x8866;
export const QUERY_RESULT_AVAILABLE_EXT = 0x8867;
export const TIME_ELAPSED_EXT = 0x88BF;
export const TIMESTAMP_EXT = 0x8E28;
export const GPU_DISJOINT_EXT = 0x8FBB;

/* EXT_disjoint_timer_query_webgl2 */
/*
export const QUERY_COUNTER_BITS_EXT = 0x8864;
export const TIME_ELAPSED_EXT = 0x88BF;
export const TIMESTAMP_EXT = 0x8E28;
export const GPU_DISJOINT_EXT = 0x8FBB;
*/

/* EXT_sRGB */
export const SRGB_EXT = 0x8C40;
export const SRGB_ALPHA_EXT = 0x8C42;
export const SRGB8_ALPHA8_EXT = 0x8C43;
export const FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT = 0x8210;

/* EXT_texture_compression_bptc */
export const COMPRESSED_RGBA_BPTC_UNORM_EXT = 0x8E8C;
export const COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT = 0x8E8D;
export const COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT = 0x8E8E;
export const COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F;

/* EXT_texture_compression_rgtc */
export const COMPRESSED_RED_RGTC1_EXT = 0x8DBB;
export const COMPRESSED_SIGNED_RED_RGTC1_EXT = 0x8DBC;
export const COMPRESSED_RED_GREEN_RGTC2_EXT = 0x8DBD;
export const COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT = 0x8DBE;

/* EXT_texture_filter_anisotropic */
export const TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
export const MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

/* EXT_texture_norm16 */
export const R16_EXT = 0x822A;
export const RG16_EXT = 0x822C;
export const RGB16_EXT = 0x8054;
export const RGBA16_EXT = 0x805B;
export const R16_SNORM_EXT = 0x8F98;
export const RG16_SNORM_EXT = 0x8F99;
export const RGB16_SNORM_EXT = 0x8F9A;
export const RGBA16_SNORM_EXT = 0x8F9B;

/* KHR_parallel_shader_compile */
export const COMPLETION_STATUS_KHR = 0x91B1;

/* OES_standard_derivatives */
export const FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;

/* OES_texture_half_float */
export const HALF_FLOAT_OES = 0x8D61;

/* OES_vertex_array_object */
export const VERTEX_ARRAY_BINDING_OES = 0x85B5;

/* OVR_multiview2 */
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_NUM_VIEWS_OVR = 0x9630;
export const FRAMEBUFFER_ATTACHMENT_TEXTURE_BASE_VIEW_INDEX_OVR = 0x9632;
export const MAX_VIEWS_OVR = 0x9631;
export const FRAMEBUFFER_INCOMPLETE_VIEW_TARGETS_OVR = 0x9633;

/* WEBGL_blend_equation_advanced_coherent  */
export const MULTIPLY = 0x9294;
export const SCREEN = 0x9295;
export const OVERLAY = 0x9296;
export const DARKEN = 0x9297;
export const LIGHTEN = 0x9298;
export const COLORDODGE = 0x9299;
export const COLORBURN = 0x929A;
export const HARDLIGHT = 0x929B;
export const SOFTLIGHT = 0x929C;
export const DIFFERENCE = 0x929E;
export const EXCLUSION = 0x92A0;
export const HSL_HUE = 0x92AD;
export const HSL_SATURATION = 0x92AE;
export const HSL_COLOR = 0x92AF;
export const HSL_LUMINOSITY = 0x92B0;

/* WEBGL_color_buffer_float */
export const RGBA32F_EXT = 0x8814;
/*
export const FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE_EXT = 0x8211;
export const UNSIGNED_NORMALIZED_EXT = 0x8C17;
*/

/* WEBGL_compressed_texture_astc */
/* Compressed Texture Format */
export const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
export const COMPRESSED_RGBA_ASTC_5x4_KHR = 0x93B1;
export const COMPRESSED_RGBA_ASTC_5x5_KHR = 0x93B2;
export const COMPRESSED_RGBA_ASTC_6x5_KHR = 0x93B3;
export const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;
export const COMPRESSED_RGBA_ASTC_8x5_KHR = 0x93B5;
export const COMPRESSED_RGBA_ASTC_8x6_KHR = 0x93B6;
export const COMPRESSED_RGBA_ASTC_8x8_KHR = 0x93B7;
export const COMPRESSED_RGBA_ASTC_10x5_KHR = 0x93B8;
export const COMPRESSED_RGBA_ASTC_10x6_KHR = 0x93B9;
export const COMPRESSED_RGBA_ASTC_10x8_KHR = 0x93BA;
export const COMPRESSED_RGBA_ASTC_10x10_KHR = 0x93BB;
export const COMPRESSED_RGBA_ASTC_12x10_KHR = 0x93BC;
export const COMPRESSED_RGBA_ASTC_12x12_KHR = 0x93BD;

export const COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR = 0x93D0;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR = 0x93D1;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR = 0x93D2;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR = 0x93D3;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR = 0x93D4;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR = 0x93D5;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR = 0x93D6;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR = 0x93D7;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR = 0x93D8;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR = 0x93D9;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR = 0x93DA;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR = 0x93DB;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR = 0x93DC;
export const COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR = 0x93DD;

/* WEBGL_compressed_texture_etc */
/* Compressed Texture Formats */
export const COMPRESSED_R11_EAC = 0x9270;
export const COMPRESSED_SIGNED_R11_EAC = 0x9271;
export const COMPRESSED_RG11_EAC = 0x9272;
export const COMPRESSED_SIGNED_RG11_EAC = 0x9273;
export const COMPRESSED_RGB8_ETC2 = 0x9274;
export const COMPRESSED_SRGB8_ETC2 = 0x9275;
export const COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9276;
export const COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2 = 0x9277;
export const COMPRESSED_RGBA8_ETC2_EAC = 0x9278;
export const COMPRESSED_SRGB8_ALPHA8_ETC2_EAC = 0x9279;

/* WEBGL_compressed_texture_etc1 */
/* Compressed Texture Format */
export const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

/* WEBGL_compressed_texture_pvrtc */
/* Compressed Texture Formats */
export const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
export const COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 0x8C01;
export const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;
export const COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 0x8C03;

/* WEBGL_compressed_texture_s3tc */
/* Compressed Texture Formats */
export const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
export const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
export const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
export const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

/* WEBGL_compressed_texture_s3tc_srgb */
/* Compressed Texture Formats */
export const COMPRESSED_SRGB_S3TC_DXT1_EXT = 0x8C4C;
export const COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT = 0x8C4D;
export const COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT = 0x8C4E;
export const COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT = 0x8C4F;

/* WEBGL_debug_renderer_info */
export const UNMASKED_VENDOR_WEBGL = 0x9245;
export const UNMASKED_RENDERER_WEBGL = 0x9246;

/* WEBGL_depth_texture */
export const UNSIGNED_INT_24_8_WEBGL = 0x84FA;

/* WEBGL_draw_buffers */
export const COLOR_ATTACHMENT0_WEBGL = 0x8CE0;
export const COLOR_ATTACHMENT1_WEBGL = 0x8CE1;
export const COLOR_ATTACHMENT2_WEBGL = 0x8CE2;
export const COLOR_ATTACHMENT3_WEBGL = 0x8CE3;
export const COLOR_ATTACHMENT4_WEBGL = 0x8CE4;
export const COLOR_ATTACHMENT5_WEBGL = 0x8CE5;
export const COLOR_ATTACHMENT6_WEBGL = 0x8CE6;
export const COLOR_ATTACHMENT7_WEBGL = 0x8CE7;
export const COLOR_ATTACHMENT8_WEBGL = 0x8CE8;
export const COLOR_ATTACHMENT9_WEBGL = 0x8CE9;
export const COLOR_ATTACHMENT10_WEBGL = 0x8CEA;
export const COLOR_ATTACHMENT11_WEBGL = 0x8CEB;
export const COLOR_ATTACHMENT12_WEBGL = 0x8CEC;
export const COLOR_ATTACHMENT13_WEBGL = 0x8CED;
export const COLOR_ATTACHMENT14_WEBGL = 0x8CEE;
export const COLOR_ATTACHMENT15_WEBGL = 0x8CEF;

export const DRAW_BUFFER0_WEBGL = 0x8825;
export const DRAW_BUFFER1_WEBGL = 0x8826;
export const DRAW_BUFFER2_WEBGL = 0x8827;
export const DRAW_BUFFER3_WEBGL = 0x8828;
export const DRAW_BUFFER4_WEBGL = 0x8829;
export const DRAW_BUFFER5_WEBGL = 0x882A;
export const DRAW_BUFFER6_WEBGL = 0x882B;
export const DRAW_BUFFER7_WEBGL = 0x882C;
export const DRAW_BUFFER8_WEBGL = 0x882D;
export const DRAW_BUFFER9_WEBGL = 0x882E;
export const DRAW_BUFFER10_WEBGL = 0x882F;
export const DRAW_BUFFER11_WEBGL = 0x8830;
export const DRAW_BUFFER12_WEBGL = 0x8831;
export const DRAW_BUFFER13_WEBGL = 0x8832;
export const DRAW_BUFFER14_WEBGL = 0x8833;
export const DRAW_BUFFER15_WEBGL = 0x8834;

export const MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;
export const MAX_DRAW_BUFFERS_WEBGL = 0x8824;
