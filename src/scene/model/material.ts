import { ValueOf } from 'ts-essentials';

/**
 * The material appearance of a mesh primitive.
 */
export interface Material {
  /** Optional name of this material. */
  name?: string;

  /** Material type. */
  readonly type: string;

  /** The alpha rendering mode of the material. */
  alphaMode: AlphaMode;

  /** Specifies whether the material is double sided. Defaults to false. */
  doubleSided: boolean;

  /** Render order of this material. Higher order materials are rendered first Defaults to 0. */
  renderOrder?: number;

  /** Other properties of this material. */
  [key: string]: unknown;
}

/**
 * Defines how the alpha value of the main factor and texture should be interpreted.
 */
export const AlphaMode = {
  /** The rendered output is fully opaque and any alpha value is ignored. */
  Opaque: 'OPAQUE',

  /** The rendered output is either fully opaque or fully transparent depending on the alpha value and the specified alpha cutoff value. */
  Mask: 'MASK',

  /** The rendered output is combined with the background using the normal painting operation (i.e. the Porter and Duff over operator). */
  Blend: 'BLEND'
} as const;

/**
 * Defines how the alpha value of the main factor and texture should be interpreted.
 */
export type AlphaMode = ValueOf<typeof AlphaMode>;
