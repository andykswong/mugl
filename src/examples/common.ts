import {  Buffer, BufferType, RenderingDevice, Resource, Usage } from '../';

export interface Example {
  init(): void;

  render(delta: number): boolean;

  destroy(): void;
}

export interface ExampleConstructor {
  new (device: RenderingDevice): Example;
}

export abstract class BaseExample implements Example {
  protected resources: Resource[] = [];

  constructor(protected readonly device: RenderingDevice) { }

  public abstract init(): void;

  public abstract render(delta: number): boolean;

  public register(...res: Resource[]): void {
    this.resources.push(...res);
  }

  public destroy(): void {
    for (const res of this.resources) {
      res.destroy();
    }
  }
}

export function bufferWithData(device: RenderingDevice, type: BufferType, data: BufferSource, usage: Usage = Usage.Static): Buffer {
  return device.buffer({ type, usage, size: data.byteLength }).data(data);
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

export function flatMap<T, U>(arr: T[], f: (x: T, i: number) => U[]): U[] {
  return arr.reduce((out, x, i) => {
    out.push(...f(x, i));
    return out;
  }, <U[]>[]);
}
