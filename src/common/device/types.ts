import { ReadonlyVec2, ReadonlyVec3, ReadonlyVec4, Vec2, Vec3, Vec4 } from 'munum';

/**
 * RGBA color type.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpucolor
 */
export type Color = Vec4;

/**
 * Readonly RGBA color type.
 */
export type ReadonlyColor = ReadonlyVec4;

/**
 * A (width, height) 2D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent2D = Vec2;

/**
 * A readonly (width, height) 2D extent.
 */
export type ReadonlyExtent2D = ReadonlyVec2;

/**
 * An (width, height, depth) 3D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type Extent3D = Vec3;

/**
 * A readonly (width, height, depth) 3D extent.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuextent3d
 */
export type ReadonlyExtent3D = ReadonlyVec3;

/**
 * A (x, y, z) 3D point.
 * @see https://gpuweb.github.io/gpuweb/#typedefdef-gpuorigin3d
 */
export type Origin3D = Vec3;

/**
 * A readonly (x, y, z) 3D point.
 */
export type ReadonlyOrigin3D = ReadonlyVec3;
