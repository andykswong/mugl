import { createImage as _createImage, getImageById as _getImageById, getCanvasById as _getCanvasById, ContextId } from '../mugl';
import { Canvas, ImageSource } from './dom-resource';

/**
 * Creates an image from URL.
 * @param context unique context ID for the app
 * @param uri image URI
 * @returns image
 */
export function createImage(context: ContextId, uri: string): ImageSource {
  const sBuf = String.UTF8.encode(uri);
  return new ImageSource(_createImage(context, changetype<usize>(sBuf), sBuf.byteLength));

}

/**
 * Gets an image handle by ID.
 * @param context unique context ID for the app
 * @param id the image ID
 * @returns image
 */
export function getImageById(context: ContextId, id: string): ImageSource {
  const sBuf = String.UTF8.encode(id);
  return new ImageSource(_getImageById(context, changetype<usize>(sBuf), sBuf.byteLength));
}

/**
 * Get canvas by ID.
 * @param context unique context ID for the app
 * @param id canvas ID
 * @returns canvas
 */
export function getCanvasById(context: ContextId, id: string): Canvas {
  const sBuf = String.UTF8.encode(id);
  return new Canvas(_getCanvasById(context, changetype<usize>(sBuf), sBuf.byteLength));
}
