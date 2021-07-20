import { MarkOptional } from 'ts-essentials';
import { BufferDescriptor, BufferType, Usage } from '../../device';

let bufferId = 1;

/**
 * A buffer points to binary geometry.
 */
 export class Buffer implements Required<BufferOptions> {
  /** Unique ID of the buffer. */
  public readonly bufferId = bufferId++;

  /** Optional name of the buffer. */
  public name?: string;

  /** Buffer data */
  public buffer: BufferSource;

  /** The buffer type. */
  public readonly type: BufferType;

  /** The buffer usage. */
  public readonly usage: Usage;

  /** The buffer size in bytes. */
  public readonly size: number;

  /** Byte stride of the data. Defaults to be tightly packed. */
  public readonly stride: number;

  /** Set to true to indicate that the buffer data needs to be re-uploaded to GPU. */
  public needUpdate = true;

  /** Callback on destroy. */
  public onDestroy?: (buffer: Buffer) => void;

  /**
   * Constructor.
   *
   * @param options buffer creation options
   */
  public constructor(options: BufferOptions) {
    this.buffer = options.buffer;
    this.size = options.size || this.buffer.byteLength;
    this.type = options.type || BufferType.Vertex;
    this.usage = options.usage || Usage.Static;
    this.stride = options.stride || 0;
  }
  
  /**
   * Destroy this buffer.
   */
   public destroy(): void {
    this.onDestroy?.(this);
  }
}

/**
 * Buffer creation options.
 */
export interface BufferOptions extends MarkOptional<BufferDescriptor, 'size'> {
  /** Buffer data */
  buffer: BufferSource;

  /** Stride of the data. Defaults to be 0 (tightly packed). */
  stride?: number;
}
