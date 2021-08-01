import { Float, RenderingDevice, Resource } from 'mugl';

export abstract class ExampleApplication {
  abstract init(): void;

  abstract render(delta: Float): boolean;

  abstract destroy(): void;
}

export type ExampleFactory = (device: RenderingDevice, webgl2: boolean) => ExampleApplication;

export abstract class BaseExample extends ExampleApplication {
  protected resources: Resource[] = [];

  public abstract init(): void;

  public abstract render(delta: Float): boolean;

  public register(resources: Resource[]): void {
    for (let i = 0; i < resources.length; ++i) {
      this.resources.push(resources[i]);
    }
  }

  public destroy(): void {
    for (let i = 0; i < this.resources.length; ++i) {
      this.resources[i].destroy();
    }
    this.resources.length = 0;
  }
}
