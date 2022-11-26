import { getImageById, ImageSource } from 'mugl/assembly';
import { APP_CONTEXT_ID } from '../../common/config';

export * from 'mugl/assembly';

export function getImage(id: string): ImageSource {
  return getImageById(APP_CONTEXT_ID, id);
}
