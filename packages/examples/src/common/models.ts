import { Float, UInt } from '../interop/mugl';

export class Model {
  public readonly indices: Float[][] | null = null;
  public readonly positions: Float[][] | null = null;
  public readonly uvs: Float[][] | null = null;
  public readonly normals: Float[][] | null = null;
  public readonly colors: Float[][] | null = null;
}

export function toVertices(model: Model): Float32Array {
  const positions = model.positions;
  const uvs = model.uvs;
  const normals = model.normals;
  const colors = model.colors;

  let countPerVertex = 0;
  let length = 0;
  if (positions) {
    length = positions.length;
    countPerVertex += 3;
  }
  if (uvs) {
    countPerVertex += 2;
  }
  if (normals) {
    countPerVertex += 3;
  }
  if (colors) {
    countPerVertex += 4;
  }

  const out = new Float32Array(countPerVertex * length);
  for (let i = 0; i < length; ++i) {
    let j = 0;
    if (positions) {
      out[i * countPerVertex + j++] = positions[i][0];
      out[i * countPerVertex + j++] = positions[i][1];
      out[i * countPerVertex + j++] = positions[i][2];
    }
    if (uvs) {
      out[i * countPerVertex + j++] = uvs[i][0];
      out[i * countPerVertex + j++] = uvs[i][1];
    }
    if (normals) {
      out[i * countPerVertex + j++] = normals[i][0];
      out[i * countPerVertex + j++] = normals[i][1];
      out[i * countPerVertex + j++] = normals[i][2];
    }
    if (colors) {
      out[i * countPerVertex + j++] = colors[i][0];
      out[i * countPerVertex + j++] = colors[i][1];
      out[i * countPerVertex + j++] = colors[i][2];
      out[i * countPerVertex + j++] = colors[i][3];
    }
  }
  return out;
}

export function toIndices(model: Model): Uint16Array {
  const indices = model.indices;
  if (!indices) {
    return new Uint16Array(0);
  }
  const out = new Uint16Array(indices.length * 3);
  for (let i = 0; i < indices.length; ++i) {
    out[i * 3] = indices[i][0] as UInt;
    out[i * 3 + 1] = indices[i][1] as UInt;
    out[i * 3 + 2] = indices[i][2] as UInt;
  }
  return out;
}

export const Triangle: Model = {
  positions: [
    [0.0, 0.5, 0.0],
    [0.5, -0.5, 0.0],
    [-0.5, -0.5, 0.0]
  ],
  colors: [
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
  ]
} as Model;

export const Quad: Model = {
  positions: [
    [-1.0, -1.0, 1.0], [+1.0, -1.0, 1.0], [+1.0, +1.0, 1.0], // first triangle
    [-1.0, -1.0, 1.0], [+1.0, +1.0, 1.0], [-1.0, +1.0, 1.0]  // second triangle
  ],
  uvs: [
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0],
    [0.0, 0.0], [1.0, 1.0], [0.0, 1.0]
  ]
} as Model;

export const Cube: Model = {
  indices: [
    [2, 1, 0], [2, 0, 3],       // positive z face
    [6, 5, 4], [6, 4, 7],       // negative z face
    [10, 9, 8], [10, 8, 11],    // positive x face
    [14, 13, 12], [14, 12, 15], // negative x face
    [18, 17, 16], [18, 16, 19], // positive y face
    [20, 21, 22], [23, 20, 22]  // negative y face
  ],
  positions: [
    [-1.0, +1.0, +1.0], [+1.0, +1.0, +1.0], [+1.0, -1.0, +1.0], [-1.0, -1.0, +1.0], // positive z face
    [+1.0, +1.0, -1.0], [-1.0, +1.0, -1.0], [-1.0, -1.0, -1.0], [+1.0, -1.0, -1.0], // negative z face
    [+1.0, +1.0, +1.0], [+1.0, +1.0, -1.0], [+1.0, -1.0, -1.0], [+1.0, -1.0, +1.0], // positive x face
    [-1.0, +1.0, -1.0], [-1.0, +1.0, +1.0], [-1.0, -1.0, +1.0], [-1.0, -1.0, -1.0], // negative x face
    [-1.0, +1.0, -1.0], [+1.0, +1.0, -1.0], [+1.0, +1.0, +1.0], [-1.0, +1.0, +1.0], // positive y face
    [-1.0, -1.0, -1.0], [+1.0, -1.0, -1.0], [+1.0, -1.0, +1.0], [-1.0, -1.0, +1.0]  // negative y face
  ],
  uvs: [
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0],
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0],
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0],
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0],
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0],
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]
  ],
  normals: [
    [0, 0, +1.0], [0, 0, +1.0], [0, 0, +1.0], [0, 0, +1.0],
    [0, 0, -1.0], [0, 0, -1.0], [0, 0, -1.0], [0, 0, -1.0],
    [+1.0, 0, 0], [+1.0, 0, 0], [+1.0, 0, 0], [+1.0, 0, 0],
    [-1.0, 0, 0], [-1.0, 0, 0], [-1.0, 0, 0], [-1.0, 0, 0],
    [0, +1.0, 0], [0, +1.0, 0], [0, +1.0, 0], [0, +1.0, 0],
    [0, -1.0, 0], [0, -1.0, 0], [0, -1.0, 0], [0, -1.0, 0]
  ],
  colors: [
    [1.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0], [0.0, 0.0, 1.0, 1.0], [0.0, 0.0, 1.0, 1.0], [0.0, 0.0, 1.0, 1.0],
    [1.0, 1.0, 0.0, 1.0], [1.0, 1.0, 0.0, 1.0], [1.0, 1.0, 0.0, 1.0], [1.0, 1.0, 0.0, 1.0],
    [0.0, 1.0, 1.0, 1.0], [0.0, 1.0, 1.0, 1.0], [0.0, 1.0, 1.0, 1.0], [0.0, 1.0, 1.0, 1.0],
    [1.0, 0.0, 1.0, 1.0], [1.0, 0.0, 1.0, 1.0], [1.0, 0.0, 1.0, 1.0], [1.0, 0.0, 1.0, 1.0]
  ]
} as Model;
