import { Buffer, BufferType, Float, RenderingDevice, Usage } from 'mugl';

export function createBuffer(
  device: RenderingDevice, data: ArrayBufferView, type: BufferType = BufferType.Vertex, usage: Usage = Usage.Static
): Buffer {
  return device
    .buffer({ type, usage, size: data.byteLength })
    .data(data);
}

export function createFloat32Array(data: Float[]): Float32Array {
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; ++i) {
    out[i] = data[i];
  }
  return out;
}
