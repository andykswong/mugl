/**
 * Texture image source type.
 */
export declare type ImageSource = TexImageSource;
/**
 * JS number type.
 */
export declare type Num = number;
/**
 * Float type.
 */
export declare type Float = number;
/**
 * Int type.
 */
export declare type Int = number;
/**
 * Unsigned int type.
 */
export declare type UInt = number;
/**
 * Unsigned int array type.
 */
export declare type UIntArray = UInt[];
/**
 * RGBA color type.
 */
export declare type Color = [r: number, g: number, b: number, a: number];
/**
 * An (width, height) 2D extent.
 */
export declare type Extent2D = [width: number, height: number];
/**
 * An (width, height, depth) 3D extent.
 */
export declare type Extent3D = [width: number, height: number, depth: number];
/**
 * A (x, y) 2D point.
 */
export declare type Origin2D = [x: number, y: number];
/**
 * A (x, y, z) 3D point.
 */
export declare type Origin3D = [x: number, y: number, z: number];
/**
 * A future indicates the completeness of an async task.
 * This is used as an alternative to Promise for compatibility with non-event-driven environments,
 * i.e. AssemblyScript / WebAssembly.
 */
export interface Future {
    /** Returns if the future is resolved. */
    get done(): boolean;
}
//# sourceMappingURL=primitive.d.ts.map