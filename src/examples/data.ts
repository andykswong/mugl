import { loadImage, toImage } from './common';

export const Quad = {
  positions: [
    [-1.0, -1.0, 1.0], [+1.0, -1.0, 1.0], [+1.0, +1.0, 1.0], // first triangle
    [-1.0, -1.0, 1.0], [+1.0, +1.0, 1.0], [-1.0, +1.0, 1.0]  // second triangle
  ],
  uvs: [
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0],
    [0.0, 0.0], [1.0, 1.0], [0.0, 1.0]
  ]
};

export const Cube = {
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
};

export function skyBox(texSize: number): Promise<HTMLImageElement[]> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = texSize;
  const ctx = canvas.getContext('2d')!;

  const skyColor = '#28ccdf', groundColor = '#39314b';
  const topDownGrd = ctx.createLinearGradient(0, 0, 0, texSize);
  topDownGrd.addColorStop(0, skyColor);
  topDownGrd.addColorStop(0.4, '#8aebf1');
  topDownGrd.addColorStop(0.99, '#dff6f5');
  topDownGrd.addColorStop(1, groundColor);

  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, texSize, texSize);
  const topImg = toImage(ctx);

  ctx.fillStyle = groundColor;
  ctx.fillRect(0, 0, texSize, texSize);
  const bottomImg = toImage(ctx);

  ctx.fillStyle = topDownGrd;
  ctx.fillRect(0, 0, texSize, texSize);
  const sideImg = toImage(ctx);

  return Promise.all([sideImg, topImg, bottomImg]);
}

export const airplane = () => loadImage('./airplane.png');
