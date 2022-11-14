import { TEX_SIZE } from '../common';
import { airplane, skyBox } from './images';

export * from './images';
export * from './utils';

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
    img.onload = onload;
    img.onerror = reject;
    div.appendChild(img);

    const sky = skyBox(texSize);
    remaining += sky.length;
    for (let i = 0; i < sky.length; ++i) {
      sky[i].id = `sky${i}`;
      sky[i].onload = onload;
      sky[i].onerror = reject;
      div.appendChild(sky[i]);
    }
  });
}
