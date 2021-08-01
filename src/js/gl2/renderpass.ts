import { MUGL_DEBUG } from '../../common/config';
import {
  GLenum, Texture, hasStencil, Int, isDepthStencil, is3DTexture, RenderPassDescriptor, ReadonlyTextureView,
  RenderPassProperties, TextureView
} from '../../common';
import { GLRenderPass as IGLRenderPass, GLRenderingDevice, GL1Feature } from '../device';
import { GLTexture } from './texture';

export class GLRenderPass implements IGLRenderPass {
  public readonly props: RenderPassProperties;

  public glfb: WebGLFramebuffer | null = null;
  public glrfb: (WebGLFramebuffer | null)[] = [];

  private readonly gl: WebGLRenderingContext;

  public constructor(context: GLRenderingDevice, props: RenderPassDescriptor = {}) {
    const gl = this.gl = context.gl;
    const drawBuffersExt: WEBGL_draw_buffers | null = context.feature(GL1Feature.DrawBuffers);

    const color = (props.color?.map(initTextureView) || []) as ReadonlyTextureView[];
    const depth = initTextureView(props.depth);
    const withStencil = (depth && hasStencil(depth.tex.props.format)) || false;
    this.props = {
      color,
      depth,
      clearColor: props.clearColor || null,
      clearDepth: props.clearDepth ?? NaN,
      clearStencil: props.clearStencil ?? NaN
    };

    if (color.length) {
      // An offscreen pass, need to create a framebuffer with color- and depth attachments
      this.glfb = gl.createFramebuffer();
      gl.bindFramebuffer(GLenum.FRAMEBUFFER, this.glfb);

      const maxAtt = drawBuffersExt || context.webgl2 ? color.length : 1;

      for (let i = 0; i < maxAtt; ++i) {
        if (context.webgl2 && color[i].tex.props.samples > 1) {
          // Attach multisample renderbuffer for MSAA offscreen rendering
          gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER, GLenum.COLOR_ATTACHMENT0 + i, GLenum.RENDERBUFFER,
            (color[i].tex as GLTexture).glrb);
        } else {
          framebufferTexture(gl, GLenum.COLOR_ATTACHMENT0 + i, color[i]);
        }
      }

      // TODO: [Feature] implement multiview
      if (maxAtt > 1) {
        if (context.webgl2) {
          (gl as WebGL2RenderingContext).drawBuffers(color.map((_, i) => GLenum.COLOR_ATTACHMENT0 + i));
        } else if (drawBuffersExt) {
          drawBuffersExt.drawBuffersWEBGL(color.map((_, i) => GLenum.COLOR_ATTACHMENT0 + i));
        }
      }

      // Attach optional depth-stencil buffer to framebuffer
      if (depth) {
        if (depth.tex.props.renderTarget || (context.webgl2 && depth.tex.props.samples > 1)) { // Use renderbuffer
          gl.framebufferRenderbuffer(GLenum.FRAMEBUFFER, withStencil ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT,
            GLenum.RENDERBUFFER, (depth.tex as GLTexture).glrb);
        } else if (isDepthStencil(depth.tex.props.format)) { // Use depth texture
          framebufferTexture(gl, withStencil ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT, depth);
        } else {
          if (MUGL_DEBUG) {
            console.error('Invalid depth texture format', depth.tex);
          }
        }
      }

      if (MUGL_DEBUG) {
        console.assert(
          gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || gl.isContextLost(),
          'Framebuffer completeness check failed'
        );
      }

      if (context.webgl2) {
        // WebGL has no support for multisample textures. We will render to MSAA renderbuffers
        // and blit to the resolve renderbuffers which have textures attached.
        for (let i = 0; i < maxAtt; ++i) {
          this.glrfb.push(color[i].tex.props.samples > 1 ?
            createResolveFrameBuffer(gl, GLenum.COLOR_ATTACHMENT0, color[i]) : null);
        }
        this.glrfb.push(depth && depth.tex.props.samples > 1 ?
          createResolveFrameBuffer(gl, withStencil ? GLenum.DEPTH_STENCIL_ATTACHMENT : GLenum.DEPTH_ATTACHMENT, depth) : null);
      }
    }
  }

  public destroy(): void {
    this.gl.deleteFramebuffer(this.glfb);
    this.glfb = null;
    for (const glrfb of this.glrfb) {
      this.gl.deleteFramebuffer(glrfb);
    }
    this.glrfb = [];
  }

  public resolve(): void {
    // Blit main framebuffer content to MSAA resolve framebuffers so that texture contents are updated
    for (let i = 0; i < this.glrfb.length - 1; ++i) {
      if (this.glrfb[i]) {
        blitFramebuffer(<WebGL2RenderingContext>this.gl, this.glfb, this.glrfb[i], this.props.color[i].tex,
          GLenum.COLOR_BUFFER_BIT, GLenum.COLOR_ATTACHMENT0 + i);
      }
    }
    const depthFb = this.glrfb[this.glrfb.length - 1];
    if (this.props.depth && depthFb) {
      blitFramebuffer(<WebGL2RenderingContext>this.gl, this.glfb, depthFb,
        this.props.depth.tex, GLenum.DEPTH_BUFFER_BIT | GLenum.STENCIL_BUFFER_BIT);
    }
  }
}

function framebufferTexture(gl: WebGLRenderingContext, attachment: GLenum, { tex, slice, mipLevel }: ReadonlyTextureView): void {
  if (is3DTexture(tex.props.type)) {
    (gl as WebGL2RenderingContext)
      .framebufferTextureLayer(GLenum.FRAMEBUFFER, attachment, (tex as GLTexture).glt, mipLevel, slice);
  } else {
    const texTarget = (tex.props.type === GLenum.TEXTURE_CUBE_MAP) ? GLenum.TEXTURE_CUBE_MAP_POSITIVE_X + slice : tex.props.type;
    gl.framebufferTexture2D(GLenum.FRAMEBUFFER, attachment, texTarget, (tex as GLTexture).glt, mipLevel);
  }
}

function createResolveFrameBuffer(
  gl: WebGLRenderingContext, attachment: GLenum, view: ReadonlyTextureView
): WebGLFramebuffer | null {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(GLenum.FRAMEBUFFER, fb);
  framebufferTexture(gl, attachment, view);
  if (MUGL_DEBUG) {
    console.assert(
      gl.checkFramebufferStatus(GLenum.FRAMEBUFFER) === GLenum.FRAMEBUFFER_COMPLETE || gl.isContextLost(),
      'Framebuffer completeness check failed for MSAA resolve buffer'
    );
  }
  return fb;
}

function blitFramebuffer(
  gl2: WebGL2RenderingContext, from: WebGLFramebuffer | null, to: WebGLFramebuffer | null,
  tex: Texture, mask: number, attachment: Int = -1
): void {
  gl2.bindFramebuffer(GLenum.READ_FRAMEBUFFER, from);
  gl2.bindFramebuffer(GLenum.DRAW_FRAMEBUFFER, to);
  if (attachment >= 0) {
    gl2.readBuffer(attachment);
  }
  gl2.blitFramebuffer(
    0, 0, tex.props.width, tex.props.height,
    0, 0, tex.props.width, tex.props.height,
    mask, GLenum.NEAREST
  );
}

function initTextureView(view?: TextureView | null): ReadonlyTextureView | null {
  if (view) {
    return {
      slice: 0,
      mipLevel: 0,
      ...view
    };
  }
  return null;
}
