import * as mugl from '../index';

describe('mugl', () => {
  test('module can load', () => {
    expect(mugl.is3DTexture(mugl.TexType.Tex3D)).toBeTruthy();
  });
});
