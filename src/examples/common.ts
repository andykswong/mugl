import { Buffer, BufferType, GLRenderingDevice, RenderingDevice, Resource, Usage } from '..';

export interface Example {
  init(): void;

  render(delta: number): boolean;

  destroy(): void;
}

export interface ExampleConstructor {
  new (device: GLRenderingDevice): Example;
}

export abstract class BaseExample implements Example {
  protected resources: Resource[] = [];

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

export function flatMap<T, U>(arr: T[], f: (x: T, i: number) => U[]): U[] {
  return arr.reduce((out, x, i) => {
    out.push(...f(x, i));
    return out;
  }, [] as U[]);
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

export function toImage(ctx: CanvasRenderingContext2D): Promise<HTMLImageElement> {
  return new Promise((resolve) => ctx.canvas.toBlob((blob) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => resolve(img);
  }));
}
