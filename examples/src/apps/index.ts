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
  new AppDefinition('instancing', 'Instancing', (device) => new InstancingExample(device)),
  new AppDefinition('texture', 'Textures', (device) => new TextureExample(device)),
  new AppDefinition('stencil', 'Stencil', (device, webgl2) => new StencilExample(device)),
  new AppDefinition('postprocess', 'Post-processing', (device) => new PostprocessExample(device)),
  new AppDefinition('mrt', 'Multi Render Targets', (device, webgl2) => new MRTExample(device, webgl2)),
  new AppDefinition('pbr', 'Physically Based Rendering', (device, webgl2) => new PbrExample(device, webgl2)),
];
