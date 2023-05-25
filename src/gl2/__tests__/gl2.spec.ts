import { GPU } from '../../gpu';
import { WebGL } from '../';

describe('WebGL', () => {
  test('WebGL fits the GPU interface', () => {
    const _: GPU = WebGL;
  });
});
