import { MarkOptional } from 'ts-essentials';
import { AddressMode, FilterMode, MinFilterMode, TextureData } from '../../device';

let textureId = 1;

/**
 * A texture and its sampler.
 */
export class Texture implements MarkOptional<Required<TextureOptions>, 'image'> {
  /** Unique ID of the texture. */
  public readonly textureId: number = textureId++;

  /** Optional name of the texture. */
  public name?: string;

  /** The width of this texture. */
  public readonly width: number;

  /** The height of this texture. */
  public readonly height: number;

  /** The sampler used by this texture. */
  public readonly sampler: Readonly<Sampler>;

  /** The image source of this texture. */
  public image?: TextureData;

  /** Set to true to indicate that the texture image needs to be re-uploaded to GPU. */
  public needUpdate = true;

  /** Callback on destroy. */
  public onDestroy?: (texture: Texture) => void;

  /**
   * Constructor.
   *
   * @param options texture creation options
   */
  public constructor(options: TextureOptions) {
    this.image = options.image;
    this.width = options.width || (options.image as HTMLImageElement)?.naturalWidth || (options.image as TexImageSource)?.width || 1;
    this.height = options.height || (options.image as HTMLImageElement)?.naturalHeight || (options.image as TexImageSource)?.height || 1;
    this.sampler = { ...options.sampler };
  }

  /**
   * Destroy this texture.
   */
  public destroy(): void {
    this.onDestroy?.(this);
  }
}

/**
 * Texture creation options.
 */
 export interface TextureOptions {
  /** The image data used by this texture. */
  image?: TextureData;

  /** Natural width of the image. */
  width?: number;

  /** Natural height of the image. */
  height?: number;

  /** The sampler used by this texture. */
  sampler?: Sampler;
}

/**
 * Texture sampler properties for filtering and wrapping modes.
 */
export interface Sampler {
  /** Magnification filter. Defaults to Nearest. */
  magFilter?: FilterMode;

  /** Minification filter. Defaults to Nearest. */
  minFilter?: MinFilterMode;

  /** U/S wrapping mode. Defaults to Clamp. */
  wrapU?: AddressMode;

  /** V/T wrapping mode. Defaults to Clamp. */
  wrapV?: AddressMode;
}
