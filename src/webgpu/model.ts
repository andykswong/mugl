import {
  BindGroup, BindGroupLayout, Buffer, Color, Device, Float, RenderPass, RenderPipeline, Sampler, Shader, Texture, TextureView, UInt
} from '../gpu';
import { WebGPUCanvasContextProvider, WebGPUCanvasOptions, WebGPUFeature } from './type';

//#region Model Types

export interface WebGPUDevice extends Device, Readonly<WebGPUCanvasOptions> {
  readonly features: WebGPUFeature;
  readonly lost: boolean;
  readonly canvas: WebGPUCanvasContextProvider;
  readonly surface: Texture;
  readonly depth: Texture;
  readonly encoder: GPUCommandEncoder | undefined;
  readonly readBuffers: GPUBuffer[];
  device?: GPUDevice;
  renderPass?: GPURenderPassEncoder;
  indexFormat?: GPUIndexFormat;

  reset(): void;
  submit(): void;
}

export interface WebGPUBuffer extends Buffer {
  readonly buffer: GPUBuffer | null;
}

export interface WebGPUTexture extends Texture {
  readonly view: GPUTextureView | null;
  readonly tex: GPUTexture | null;
  readonly msaa: GPUTexture | null;
}

export interface WebGPUSampler extends Sampler {
  readonly sampler: GPUSampler | null;
}

export interface WebGPUShader extends Shader {
  readonly shader: GPUShaderModule | null;
}

export interface WebGPUBindGroupLayout extends BindGroupLayout {
  readonly layout: GPUBindGroupLayout | null;
}

export interface WebGPUBindGroup extends BindGroup {
  readonly group: GPUBindGroup | null;
}

export interface WebGPURenderPipeline extends RenderPipeline {
  readonly pipeline: GPURenderPipeline | null;
  readonly indexFormat: GPUIndexFormat;
}

export interface WebGPURenderPass extends RenderPass {
  readonly colors: TextureView[];
  readonly colorTargets: (TextureView | undefined)[];
  readonly colorOps: WebGPURenderPassOperations<Color>[];
  readonly depth?: TextureView;
  readonly depthOps: WebGPURenderPassOperations<Float>;
  readonly stencilOps: WebGPURenderPassOperations<UInt>;
}

export interface WebGPURenderPassOperations<T = Float> {
  readonly clearValue: T;
  readonly loadOp: GPULoadOp;
  readonly storeOp: GPUStoreOp;
}

//#endregion Model Types
