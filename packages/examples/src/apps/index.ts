import { ExampleFactory } from '../common';
import { BasicExample } from './basic';
import { InstancingExample } from './instancing';
import { MRTExample } from './mrt';
import { PbrExample } from './pbr';
import { PostprocessExample } from './postprocess';
import { StencilExample } from './stencil';
import { TextureExample } from './texture';

export class AppDefinition {
  public constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly factory: ExampleFactory
  ) {
  }
}

export const Apps = [
  new AppDefinition('basic', 'Hello World', (device, useWebGPU) => new BasicExample(device, useWebGPU)),
  new AppDefinition('instancing', 'Buffers & Instancing', (device, useWebGPU) => new InstancingExample(device, useWebGPU)),
  new AppDefinition('texture', 'Texture & Sampler', (device, useWebGPU) => new TextureExample(device, useWebGPU)),
  new AppDefinition('stencil', 'Depth Stencil', (device, useWebGPU) => new StencilExample(device, useWebGPU)),
  new AppDefinition('postprocess', 'Post-processing', (device, useWebGPU) => new PostprocessExample(device)),
  new AppDefinition('mrt', 'Multi Render Targets', (device, useWebGPU) => new MRTExample(device)),
  new AppDefinition('pbr', 'Physically Based Rendering', (device, useWebGPU) => new PbrExample(device)),
];
