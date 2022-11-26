import { Device, Float, Resource, UInt } from '../interop/mugl';

export abstract class ExampleApplication {
  public init(): void { /* empty */ }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public render(delta: Float): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public resize(width: UInt, height: UInt): void { /* empty */ }

  public destroy(): void { /* empty */ }
}

export type ExampleFactory = (device: Device) => ExampleApplication;

export abstract class BaseExample extends ExampleApplication {
  protected resources: Resource[] = [];
  protected width: UInt = 1;
  protected height: UInt = 1;

  public resize(width: UInt, height: UInt): void {
    this.width = width;
    this.height = height;
  }

  public destroy(): void {
    for (let i = 0; i < this.resources.length; ++i) {
      this.resources[i].destroy();
    }
    this.resources.length = 0;
  }

  protected register(resources: Resource[]): void {
    for (let i = 0; i < resources.length; ++i) {
      this.resources.push(resources[i]);
    }
  }
}
