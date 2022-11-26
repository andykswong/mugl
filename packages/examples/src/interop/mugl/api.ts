export * from 'mugl';

export function getImage(id: string): HTMLImageElement | null {
  return document.getElementById(id) as HTMLImageElement;
}
