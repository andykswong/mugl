import * as mugl from '../index';

describe('mugl', () => {
  test('module can load', () => {
    expect(mugl.AddressMode.ClampToEdge).toBeTruthy();
  });
});
