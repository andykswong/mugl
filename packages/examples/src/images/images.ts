import { loadImage, toImage } from './utils';

export function skyBox(texSize: number): HTMLImageElement[] {
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

  return [sideImg, topImg, bottomImg];
}

export function airplane(): HTMLImageElement {
  return loadImage('./airplane.png');
}
