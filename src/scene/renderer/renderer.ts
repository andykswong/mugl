import { Pipeline, RenderingDevice, RenderPass, RenderPassContext, UniformType, UniformValuesDescriptor } from '../../device';
import { Camera, Geometry, Node } from '../model';
import { Allocator, StandardAllocator } from './allocator';
import { Environment } from './environment';
import { defaultSorter, Renderable, RenderableSorter } from './renderable';

// temp variables
const tmpRenderables: Renderable[] = [];

/**
 * Default forward renderer.
 */
export class Renderer {
  /** Primitive sorting function. */
  public sort: RenderableSorter = defaultSorter;

  protected context: RenderPassContext | null = null;

  public constructor(
    public readonly device: RenderingDevice,
    public readonly alloc: Allocator = new StandardAllocator(device)
  ) {
  }

  /**
   * Destroy this renderer and all resources held by it.
   */
  public destroy(): void {
    // TODO
  }

  /**
   * Render a scene using a camera.
   *
   * @param scene root node representing a scene to render
   * @param camera camera view
   */
  public render(scene: Node, camera: Camera): void {
    // 1. Collect primitives
    tmpRenderables.length = 0;
    scene.traverse((node) => {
      if (node.hidden) {
        return true;
      }
      if (node.mesh) {
        for (const primitive of node.mesh.primitives) {
          const renderable: Renderable = { node, primitive };
          this.alloc.pipeline(renderable);
          tmpRenderables.push(renderable);
        }
      }
    });

    if (!tmpRenderables.length) {
      return;
    }

    // 2. start a new pass as needed
    const useNewPass = !this.context;
    if (useNewPass) {
      this.beginPass();
    }

    // 3. Sort the primitives
    this.sort(tmpRenderables, camera);

    // 4. Render each primitive
    this.renderRenderables(tmpRenderables, camera, this.env(scene, camera));

    // 5. End render pass if it was created by this method previously
    if (useNewPass) {
      this.endPass();
    }
  }

  /**
   * Render sorted renderables in an active render pass.
   *
   * @param renderables list of renderables to render
   * @param camera camera view
   * @param env the environment
   */
  public renderRenderables(renderables: Renderable[], camera: Camera, env: Environment = {}): void {
    const context = this.context;
    if (!context) {
      return;
    }

    let activePipeline: Pipeline | null = null;
    let uniformCache: UniformValuesDescriptor = {};
    for (const renderable of renderables) {
      // a. Apply pipeline
      const pipeline = this.alloc.pipeline(renderable);
      if (activePipeline !== pipeline) {
        context.pipeline(activePipeline = pipeline);
        uniformCache = {};  // Changing shader requires reuploading all uniforms
      }

      // TODO: support blend color and stencil ref

      // b. Apply uniforms
      const uniforms = this.alloc.uniforms(renderable, camera, env);
      const uniformsToUpdate: UniformValuesDescriptor = {};
      for (const key in activePipeline.uniforms) {
        if (key in uniforms) {
          // Only shallow compare value against cache for efficiency. Array values are immutable in this render loop.
          // Never cache texture binding as the slots can get overridden.
          if (activePipeline.uniforms[key].type !== UniformType.Tex && uniformCache[key] === uniforms[key]) {
            continue;
          }
          uniformCache[key] = uniformsToUpdate[key] = uniforms[key];
        }
      }
      context.uniforms(uniformsToUpdate);

      // c. Submit draw call
      this.draw(pipeline, renderable.primitive.geometry);
    }
  }

  /**
   * Get the environment of a scene.
   *
   * @param scene root node representing a scene to render
   * @param camera camera view
   * @returns the scene environment
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected env(scene: Node, camera: Camera): Environment {
    return {};
  }

  /**
   * Submit a draw call for given geometry.
   */
  protected draw(pipeline: Pipeline, geometry: Geometry): void {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const draw = [
      geometry.count,
      geometry.instanceCount,
      geometry.offset
    ] as const;

    for (let i = 0; i < pipeline.buffers.length; ++i) {
      this.context!.vertex(i, this.alloc.buffer(geometry.attributes[pipeline.buffers[i].attrs[0].name].buffer));
    }

    if (geometry.indices) {
      this.context!.index(this.alloc.buffer(geometry.indices)).drawIndexed(...draw);
    } else {
      this.context!.draw(...draw);
    }
    /* eslint-enable */
  }

  /**
   * Begin a rendering pass.
   * @param pass rendering pass
   */
   protected beginPass(pass: RenderPass = this.device.pass()): void {
    this.endPass();
    this.context = this.device.render(pass);
  }

  /**
   * End the current rendering pass.
   */
   protected endPass(): void {
    this.context?.end();
    this.context = null;
  }
}
