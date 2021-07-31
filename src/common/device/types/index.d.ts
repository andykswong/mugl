/**
 * Float type.
 */
export type Float = number;

/**
 * Int32 type.
 */
export type Int = number;

/**
 * Unsigned int32 type.
 */
export type Uint = number;

/**
 * Texture image source type.
 */
export type ImageSource = TexImageSource;

/**
 * Float list type.
 */
export type FloatList = Float32Array | number[];

/**
 * RGBA color type.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolor
 */
export type Color = [r: number, g: number, b: number, a: number];

/**
 * Readonly RGBA color type.
 */
export type ReadonlyColor = Readonly<Color>;

/**
 * A (width, height) 2D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent2D = [width: number, height: number];

/**
 * A readonly (width, height) 2D extent.
 */
export type ReadonlyExtent2D = Readonly<Extent2D>;

/**
 * An (width, height, depth) 3D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent3D = [width: number, height: number, depth: number];

/**
 * A readonly (width, height, depth) 3D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type ReadonlyExtent3D = Readonly<Extent3D>;

/**
 * A (x, y, z) 3D point.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuorigin3d
 */
export type Origin3D = [x: number, y: number, z: number];

/**
 * A readonly (x, y, z) 3D point.
 */
export type ReadonlyOrigin3D = Readonly<Origin3D>;
