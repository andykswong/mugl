import { GPU } from '..';
import { WebGL } from '../gl2';

describe('WebGL', () => {
  test('WebGL fits the GPU interface', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const API: GPU = WebGL;
  });
});
