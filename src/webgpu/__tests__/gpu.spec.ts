import { GPU } from '../../gpu';
import { WebGPU } from '../index';

describe('WebGPU', () => {
  test('WebGPU fits the GPU interface', () => {
    const _: GPU = WebGPU;
  });
});
