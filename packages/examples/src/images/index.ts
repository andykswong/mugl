import { set_image_by_id } from 'mugl/wasm';
import { TEX_SIZE } from '../common';
import { airplane, skyBox } from './images';

const CACHE: Record<string, ImageBitmap> = {};

export function getImage(id: string): ImageBitmap | undefined {
  return CACHE[id];
}

export function loadImages(texSize = TEX_SIZE): Promise<void> {
  const div = document.createElement('div');
  div.style.display = 'none';
  document.body.appendChild(div);

  return new Promise((resolve, reject) => {
    let remaining = 1;
    const onload = () => {
      if (--remaining <= 0) { resolve(); }
    };

    const img = airplane();
    img.id = 'airplane';
    img.onload = async () => {
      await setImageBitmap(img);
      onload();
    };
    img.onerror = reject;
    div.appendChild(img);

    const sky = skyBox(texSize);
    remaining += sky.length;
    for (let i = 0; i < sky.length; ++i) {
      sky[i].id = `sky${i}`;
      sky[i].onload = async () => {
        await setImageBitmap(sky[i]);
        onload();
      };
      sky[i].onerror = reject;
      div.appendChild(sky[i]);
    }
  });
}

async function setImageBitmap(image: HTMLImageElement): Promise<void> {
  const tex = await createImageBitmap(image);
  CACHE[image.id] = tex;
  set_image_by_id(image.id, tex);
}
