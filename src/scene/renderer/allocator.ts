import { MUGL_DEBUG } from '../../config';
import { Buffer as GPUBuffer, Pipeline, RenderingDevice, Texture as GPUTexture, UniformValuesDescriptor } from '../../device';
import { Buffer, Camera, Texture } from '../model';
import { Environment } from './environment';
import { Renderable } from './renderable';

/**
 * Allocator for GPU resources.
 */
export interface Allocator {
  /**
   * Initialize and upload buffer to GPU.
   * @param buffer the buffer
   * @returns the GPU buffer resource
   */
  buffer(buffer: Buffer): GPUBuffer;

  /**
   * Initialize and upload texture to GPU.
   * @param texture the texture
   * @returns the GPU texture resource
   */
  texture(texture: Texture): GPUTexture;

  /**
   * Initialize the GPU pipeline for a renderable.
   *
   * @param renderable the renderable to initialize
   */
  pipeline(renderable: Renderable): Pipeline;

  /** Get the shader uniforms for rendering given renderable. */
  uniforms(renderable: Renderable, camera: Camera, env: Environment): UniformValuesDescriptor;

  /**
   * Free the GPU resources held by the given resource object.
   * @param resource buffer or texture
   */
  free(resource: Buffer | Texture): void;
}

/**
 * A shading technique.
 */
 export interface Technique {
  /** Returns a pipeline for rendering given renderable using this technique. */
  pipeline(renderable: Renderable): Pipeline;

  /** Get the shader uniforms for rendering given renderable using this technique. */
  uniforms(renderable: Renderable, camera: Camera, env: Environment): UniformValuesDescriptor;
}

/**
 * Default resource allocator.
 */
export class StandardAllocator implements Allocator {
  protected onDestroy = this.free.bind(this);

  protected readonly buffers: Record<number, GPUBuffer> = {};
  protected readonly textures: Record<number, GPUTexture> = {};
  protected readonly techniques: Record<string, Technique> = {};

  public constructor(
    protected readonly device: RenderingDevice
  ) {
  }

  /**
   * Register a shading technique.
   * @param name material type
   * @param technique the technique
   */
   public addTechnique(type: string, technique: Technique): void {
    this.techniques[type] = technique;
  }

  public buffer(buffer: Buffer): GPUBuffer {
    const gpuBuffer = this.buffers[buffer.bufferId] || (this.buffers[buffer.bufferId] = this.device.buffer(buffer));
    if (buffer.needUpdate) {
      gpuBuffer.data(buffer.buffer);
      buffer.onDestroy = this.onDestroy;
      buffer.needUpdate = false;
    }
    return gpuBuffer;
  }

  public texture(texture: Texture): GPUTexture {
    const gpuTexture = this.textures[texture.textureId] || (this.textures[texture.textureId] = 
      this.device.texture({
        size: [texture.width, texture.height]
      }, texture.sampler)
    );
    if (texture.needUpdate && texture.image) {
      gpuTexture.data(texture.image);
      texture.onDestroy = this.onDestroy;
      texture.needUpdate = false;
    }
    return gpuTexture;
  }

  public pipeline(renderable: Renderable): Pipeline {
    return this.technique(renderable).pipeline(renderable);
  }

  public uniforms(renderable: Renderable, camera: Camera, env: Environment): UniformValuesDescriptor {
    return this.technique(renderable).uniforms(renderable, camera, env);
  }

  /**
   * Get the rendering technique to be used for a renderable.
   * @param renderable renderable
   * @returns the technique
   */
  public technique(renderable: Renderable): Technique {
    const type = (renderable.material || renderable.primitive.material).type;
    const technique = this.techniques[type];
    if (MUGL_DEBUG) {
      console.assert(technique, `Invalid material type: ${type}`);
    }
    return technique;
  }

  public free(resource: Buffer | Texture): void {
    if ((resource as Buffer).bufferId) {
      this.buffers[(resource as Buffer).bufferId]?.destroy();
      delete this.buffers[(resource as Buffer).bufferId];
    } else if ((resource as Texture).textureId) {
      this.textures[(resource as Texture).textureId]?.destroy();
      delete this.textures[(resource as Texture).textureId];
    }
  }
}
