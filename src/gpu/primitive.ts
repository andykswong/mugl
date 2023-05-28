/**
 * Texture image source type.
 */
export type ImageSource = ImageBitmap | HTMLCanvasElement | HTMLVideoElement | OffscreenCanvas;

/**
 * JS number type.
 */
export type Num = number;

/**
 * Float type.
 */
export type Float = number;

/**
 * Int type.
 */
export type Int = number;

/**
 * Unsigned int type.
 */
export type UInt = number;

/**
 * Unsigned int array type.
 */
export type UIntArray = UInt[];

/**
 * RGBA color type.
 */
export type Color = [r: number, g: number, b: number, a: number];

/**
 * An (width, height) 2D extent.
 */
export type Extent2D = [width: number, height: number];

/**
 * An (width, height, depth) 3D extent.
 */
export type Extent3D = [width: number, height: number, depth: number];

/**
 * A (x, y) 2D point.
 */
export type Origin2D = [x: number, y: number];

/**
 * A (x, y, z) 3D point.
 */
export type Origin3D = [x: number, y: number, z: number];

/**
 * A future indicates the completeness of an async task.
 * This is used as an alternative to Promise for compatibility with non-event-driven environments,
 * i.e. AssemblyScript / WebAssembly.
 */
export interface Future {
    /** Returns current status of the future. */
    get status(): FutureStatus;

    /** Converts this future into a Promise. */
    then<TResult1 = void, TResult2 = never>(
        onfulfilled?: () => TResult1 | PromiseLike<TResult1>,
        onrejected?: () => TResult2 | PromiseLike<TResult2>
    ): Promise<TResult1 | TResult2>;
}

/**
 * Status of a future.
 */
export enum FutureStatus {
    /** The future is still pending. */
    Pending = 0,
    /** The future is resolved. */
    Done = 1,
    /** An error occurred while resolving the future. */
    Error = 2,
}
