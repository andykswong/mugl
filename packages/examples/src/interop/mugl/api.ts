import { ImageSource } from 'mugl';
import { getImage as _getImage } from '../../images';

export * from 'mugl';

export function getImage(id: string): ImageSource {
  return _getImage(id) as ImageSource;
}
