import { BindGroupEntry, BindGroupLayoutEntry, VertexBufferLayout } from '../descriptor';
import { Color, Float, UInt } from '../primitive';
import { BindGroup, BindGroupLayout, Buffer, Device, RenderPass, RenderPipeline, Sampler, Shader, Texture } from '../resource';
import { BindingType } from '../type';
import { Canvas, WebGL2Feature } from './type';
export interface WebGL2Device extends Device {
    readonly canvas: Canvas;
    readonly gl: WebGL2RenderingContext;
    readonly features: WebGL2Feature;
    readonly extDrawBuffersi: OES_draw_buffers_indexed | null;
    pass: WebGL2RenderPass | null;
    state: WebGL2State;
}
export interface WebGL2Buffer extends Buffer {
    readonly gl: WebGL2RenderingContext;
    readonly glb: WebGLBuffer | null;
    readonly type: UInt;
    readonly size: UInt;
}
export interface WebGL2Texture extends Texture {
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
export interface WebGL2Sampler extends Sampler {
    readonly gl: WebGL2RenderingContext;
    readonly gls: WebGLSampler | null;
}
export interface WebGL2Shader extends Shader {
    readonly gl: WebGL2RenderingContext;
    readonly gls: WebGLShader | null;
}
export interface WebGL2RenderPass extends RenderPass {
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
export interface WebGL2BindGroupLayout extends BindGroupLayout {
    readonly entries: (BindGroupLayoutEntry & {
        binding: UInt;
    })[];
}
export interface WebGL2BindGroup extends BindGroup {
    readonly entries: (BindGroupEntry & {
        binding: UInt;
    })[];
}
export interface WebGL2RenderPipeline extends RenderPipeline {
    readonly gl: WebGL2RenderingContext;
    readonly glp: WebGLProgram | null;
    readonly cache: UniformCache[][];
    readonly buffers: VertexBufferLayout[];
    readonly state: WebGL2PipelineState;
}
export interface WebGL2State {
    copyFrameBuffer: WebGLFramebuffer | null;
    buffers: WebGL2BufferAttributes[];
    state: WebGL2PipelineState;
    pipeline: WebGL2RenderPipeline | null;
    index: WebGLBuffer | null;
    stencilRef: UInt;
    scissor: boolean;
}
export interface WebGL2Attribute {
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
export interface WebGL2BufferAttributes {
    glb: WebGLBuffer | null;
    attributes: WebGL2Attribute[];
    stride: UInt;
    step: UInt;
    offset: UInt;
    instanceOffset: UInt;
}
export interface WebGL2PipelineState extends WebGL2PipelineBlendState {
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
    drawBuffers: WebGL2PipelineBlendState[];
}
export interface WebGL2PipelineBlendState {
    blendWriteMask: UInt;
    blendColorOp: UInt;
    blendColorSrcFactor: UInt;
    blendColorDstFactor: UInt;
    blendAlphaOp: UInt;
    blendAlphaSrcFactor: UInt;
    blendAlphaDstFactor: UInt;
}
/** An entry of uniform info cache */
export interface UniformCache {
    /** Bind group entry name. */
    label: string;
    /** Binding location. */
    binding: UInt;
    /** The type of binding. */
    type: BindingType;
    /** Uniform location. */
    loc: WebGLUniformLocation | null;
    /** Uniform block index. */
    index: GLuint;
    /** Uniform buffer / Texture bind slot ID. */
    slot: number;
    /** Dynamic offset uniform buffer. */
    bufferDynamicOffset?: boolean;
}
//# sourceMappingURL=model.d.ts.map