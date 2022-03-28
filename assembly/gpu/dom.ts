import { createImage as _createImage, getImageById as _getImageById, getCanvasById as _getCanvasById } from '../mugl';
import { Canvas, ImageSource } from './dom-resource';

/**
 * Creates an image from URL.
 * @param uri image URI
 * @returns image
 */
export function createImage(uri: string): ImageSource {
  const sBuf = String.UTF8.encode(uri);
  return new ImageSource(_createImage(changetype<usize>(sBuf), sBuf.byteLength));

}

/**
 * Gets an image handle by ID.
 * @param id the image ID
 * @returns image
 */
export function getImageById(id: string): ImageSource {
  const sBuf = String.UTF8.encode(id);
  return new ImageSource(_getImageById(changetype<usize>(sBuf), sBuf.byteLength));
}

/**
 * Get canvas by ID.
 * @param id canvas ID
 * @returns canvas
 */
export function getCanvasById(id: string): Canvas {
  const sBuf = String.UTF8.encode(id);
  return new Canvas(_getCanvasById(changetype<usize>(sBuf), sBuf.byteLength));
}
