import { Buffer, BufferUsage, Device, Float, UInt, WebGL } from '../interop/mugl';

export function createBuffer(
  device: Device, data: ArrayBufferView, usage: BufferUsage = BufferUsage.Vertex
): Buffer {
  const buffer = WebGL.createBuffer(device, { usage, size: data.byteLength });
  WebGL.writeBuffer(device, buffer, data);
  return buffer;
}

// Below helpers are for AssemblyScript which does not have constructor to convert array to typed array.

export function createFloat32Array(data: Float[]): Float32Array {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    out[i] = data[i];
  }
  return out;
}

export function createUint16Array(data: UInt[]): Uint16Array {
  const out = new Uint16Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    out[i] = data[i];
  }
  return out;
}
