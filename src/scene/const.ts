import { mat4, quat, ReadonlyMat4, ReadonlyQuat, ReadonlyVec3, vec3 } from 'gl-matrix';

/** 4x4 identity matrix. */
export const I4: ReadonlyMat4 = mat4.create();

/** Identity quat. */
export const Q1: ReadonlyQuat = quat.create();

/** zero vec3. */
export const Z3: ReadonlyVec3 = vec3.create();

/** scaling identity vec3 = [1, 1, 1]. */
export const VI3: ReadonlyVec3 = vec3.fromValues(1, 1, 1);
