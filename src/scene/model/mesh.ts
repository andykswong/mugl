import { IndexFormat, PrimitiveType, VertexFormat } from '../../device';
import { Buffer } from './buffer';
import { Material } from './material';

let primitiveId = 1;

/**
 * A set of primitives to be rendered.
 */
export interface Mesh {
  /** Optional name of the mesh. */
  name?: string;

  /** An array of primitives, each defining geometry to be rendered with a material. */
  primitives: Primitive[];

  /** Other properties of the mesh. */
  [k: string]: unknown;
}

/**
 * Geometry to be rendered with the given material.
 */
export class Primitive {
  /** Unique ID of the primitive. */
  public readonly primitiveId: number = primitiveId++;

  /** Set to true to indicate that the primitive has changed and a new GPU pipeline may be needed. */
  public needUpdate = true;

  /** Other properties of the primitive. */
  [k: string]: unknown;

  public constructor(
    /** The geometry of this primitive. */
    public geometry: Geometry,
    /** The material to apply to this primitive when rendering. */
    public material: Material,
    /** The type of primitives to render. Defaults to 3 (triangles) */
    public mode: PrimitiveType = 3
  ) {
  }
}

/**
 * The geometry of a mesh primitive to be rendered.
 */
export interface Geometry {
  /**
   * A dictionary object, where each key corresponds to mesh attribute semantic and each value is the attribute data.
   */
  attributes: Record<string, VertexAttribute>;

  /** The index buffer for the geometry. */
  indices?: Buffer;

  /** The index format. Defaults to UInt16. */
  indexFormat?: IndexFormat;

  /** The number of vertices to draw. */
  count: number;

  /** Instance count for the geometry. Defaults to 1. */
  instanceCount?: number;

  /** The offset to first vertex / index to draw. Defaults to 0. */
  offset?: number;

  /** Other properties of the geometry. */
  [k: string]: unknown;
}

/**
 * A vertex attribute descriptor.
 */
 export interface VertexAttribute {
  /** The buffer data. */
  buffer: Buffer;

  /** Vertex format */
  format: VertexFormat;

  /** Offset in buffer in bytes. Defaults to 0. */
  byteOffset?: number;
  
  /** Specify if this data is instanced. Defaults to false. */
  instanced?: boolean;
}
