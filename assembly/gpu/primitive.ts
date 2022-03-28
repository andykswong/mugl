import { FutureId, isFutureDone } from '../mugl';
import { ImageSource } from './dom-resource';

export { ImageSource };

/**
 * JS number type.
 */
export type Num = f64;

/**
 * Float type.
 */
export type Float = f32;

/**
 * Int type.
 */
export type Int = i32;

/**
 * Unsigned Int type.
 */
export type UInt = u32;

/**
 * Unsigned int array type.
 */
 export type UIntArray = StaticArray<UInt>;

/**
 * RGBA color type.
 */
export type Color = StaticArray<Float>;

/**
 * An (width, height) 2D extent.
 */
export type Extent2D = StaticArray<UInt>;

/**
 * An (width, height, depth) 3D extent.
 */
export type Extent3D = StaticArray<UInt>;

/**
 * A (x, y) 2D point.
 */
export type Origin2D = StaticArray<UInt>;

/**
 * A (x, y, z) 3D point.
 */
export type Origin3D = StaticArray<UInt>;

/**
 * Future type.
 */
export class Future {
  private _done: boolean = false;

  public constructor(
    public readonly id: FutureId
  ) {
  }

  /** Returns if the future is resolved. */
  public get done(): boolean {
    return this._done || (this._done = isFutureDone(this.id));
  }
}
