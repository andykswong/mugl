/* Primitive data types */
export type Float = f32;
export type Int = i32;
export type Uint = u32;

/* Opaque pointers */
export type ImageSource = u32;

/* Static array type alias */
export type FloatList = StaticArray<Float>;
export type ReadonlyFloatList = FloatList;
export type Color = StaticArray<Float>;
export type ReadonlyColor = Color;
export type Extent2D = StaticArray<Float>;
export type ReadonlyExtent2D = Extent2D;
export type Extent3D = StaticArray<Float>;
export type ReadonlyExtent3D = Extent3D;
export type Origin2D = StaticArray<Float>;
export type ReadonlyOrigin2D = Origin2D;
export type Origin3D = StaticArray<Float>;
export type ReadonlyOrigin3D = Origin3D;

/**
 * Convert a dynamic array to float list.
 */
export function toFloatList(array: Float[]): FloatList {
  // @ts-ignore: valid AssemblyScript
  return StaticArray.fromArray(array);
}
