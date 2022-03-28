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
  new AppDefinition('basic', 'Hello World', (device) => new BasicExample(device)),
  new AppDefinition('instancing', 'Buffers & Instancing', (device) => new InstancingExample(device)),
  new AppDefinition('texture', 'Texture & Sampler', (device) => new TextureExample(device)),
  new AppDefinition('stencil', 'Depth Stencil', (device) => new StencilExample(device)),
  new AppDefinition('postprocess', 'Post-processing', (device) => new PostprocessExample(device)),
  new AppDefinition('mrt', 'Multi Render Targets', (device) => new MRTExample(device)),
  new AppDefinition('pbr', 'Physically Based Rendering', (device) => new PbrExample(device)),
];
