import { FutureId, getFutureStatus } from '../mugl';
import { ImageSource } from '../dom';

export { ImageSource };

/** JS number type. */
export type Num = f64;

/** Float type. */
export type Float = f32;

/** Int type. */
export type Int = i32;

/** Unsigned Int type. */
export type UInt = u32;

/** Unsigned int array type. */
 export type UIntArray = StaticArray<UInt>;

/** RGBA color type. */
export type Color = StaticArray<Float>;

/** An (width, height) 2D extent. */
export type Extent2D = StaticArray<UInt>;

/** An (width, height, depth) 3D extent. */
export type Extent3D = StaticArray<UInt>;

/** A (x, y) 2D point. */
export type Origin2D = StaticArray<UInt>;

/** A (x, y, z) 3D point. */
export type Origin3D = StaticArray<UInt>;

/** Future base type. */
export class Future<T = null> {
  private _status: FutureStatus = FutureStatus.Pending;

  public constructor(
    public readonly id: FutureId
  ) {
  }

  /** Returns resolved value of the future. */
  public get value(): T | null {
    return null;
  }

  /** Returns current status of the future. */
  public get status(): FutureStatus {
    return this._status || (this._status = getFutureStatus(this.id));
  }
}

/** Status of a future. */
 export enum FutureStatus {
  /** The future is still pending. */
  Pending = 0,
  /** The future is resolved. */
  Done = 1,
  /** An error occurred while resolving the future. */
  Error = 2,
}
