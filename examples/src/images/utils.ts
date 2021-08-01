
export function getImage(uri: string): HTMLImageElement {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = uri;
  return img;
}

export function toImage(ctx: CanvasRenderingContext2D): HTMLImageElement {
  const img = new Image();
  ctx.canvas.toBlob((blob) => img.src = URL.createObjectURL(blob));
  return img;
}
