import { Canvas, getGLDevice as getGLDeviceId } from '../mugl';
import { GLRenderingDevice } from './device';

/**
 * Create a {@link GLRenderingDevice}.
 * @param canvas the canvas to be used
 * @param options context initialization options
 * @returns rendering device instance, or null if WebGL is not supported
 */
// @ts-ignore: Valid AssemblyScript
export function getGLDevice(canvas: Canvas, options: GLContextAttributes = {}): GLRenderingDevice | null {
  const deviceId = getGLDeviceId(canvas, options.toValue());
  if (!deviceId) { return null; }
  return new GLRenderingDevice(deviceId);
}

/**
 * WebGL context attributes.
 */
export class GLContextAttributes {
  alpha: boolean = true;
  antialias: boolean = true;
  depth: boolean = true;
  desynchronized: boolean = false;
  failIfMajorPerformanceCaveat: boolean = false;
  powerPreference: string = 'default';
  premultipliedAlpha: boolean = true;
  preserveDrawingBuffer: boolean = false;
  stencil: boolean = false;
  webgl2: boolean = false;

  /**
   * Get the attributes as bit field.
   * @returns bit field representing this object.
   */
  public toValue(): u32 {
    let result: u32 = 0;
    if (this.alpha) { result = result | 1; }
    if (this.antialias) { result = result | (1 << 1); }
    if (this.depth) { result = result | (1 << 2); }
    if (this.desynchronized) { result = result | (1 << 3); }
    if (this.failIfMajorPerformanceCaveat) { result = result | (1 << 4); }
    if (this.powerPreference == 'low-power') { result = result | (1 << 5); }
    if (this.powerPreference == 'high-performance') { result = result | (1 << 6); }
    if (this.premultipliedAlpha) { result = result | (1 << 7); }
    if (this.preserveDrawingBuffer) { result = result | (1 << 8); }
    if (this.stencil) { result = result | (1 << 9); }
    if (this.webgl2) { result = result | (1 << 10); }
    return result;
  }
}
