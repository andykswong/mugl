/**
 * AssemblyScript type declarations to make tsc happy.
 *
 * @packageDocumentation
 * @internal
 */

declare type StaticArray<T> = T[];

declare type Required<T> = {
  [P in keyof T]-?: T[P];
};

declare type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
