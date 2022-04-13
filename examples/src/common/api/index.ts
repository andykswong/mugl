import { getImageById as _getImageById, ImageSource, WebGL as API } from 'mugl';
import { APP_CONTEXT_ID } from '../config';

export { API };

export function getImageById(id: string): ImageSource {
  return _getImageById(APP_CONTEXT_ID, id);
}
