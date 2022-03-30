import { getImageById as _getImageById, ImageSource } from 'mugl';
import { APP_CONTEXT_ID } from '../config';

export function getImageById(id: string): ImageSource {
  return _getImageById(APP_CONTEXT_ID, id);
}
