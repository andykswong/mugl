export function getImageById(id: string): HTMLImageElement | null {
  return document.getElementById(id) as HTMLImageElement;
}
