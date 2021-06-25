import {
  Color, GL1Feature, GLRenderingDevice, GLRenderPass as IGLRenderPass, GLTexture, hasStencil, isDepthStencil,
  is3DTexture, RenderPassDescriptor, TextureView
} from '../device';
import {
  GL_COLOR_ATTACHMENT0, GL_COLOR_BUFFER_BIT, GL_DEPTH_ATTACHMENT, GL_DEPTH_BUFFER_BIT, GL_DEPTH_STENCIL_ATTACHMENT,
  GL_DRAW_FRAMEBUFFER, GL_FRAMEBUFFER, GL_FRAMEBUFFER_COMPLETE, GL_NEAREST, GL_READ_FRAMEBUFFER, GL_RENDERBUFFER,
  GL_STENCIL_BUFFER_BIT, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_POSITIVE_X
} from '../device';

const EMPTY = {};
const EMPTY_ARR: unknown[] = [];

export class GLRenderPass implements IGLRenderPass {
  public readonly color: readonly Readonly<Required<TextureView>>[];
  public readonly depth: Readonly<Required<TextureView>> | null;
  public readonly clearColor: Color | false;
  public readonly clearDepth: number | false;
  public readonly clearStencil: number | false;

  public glfb: WebGLFramebuffer | null;
  public glrfb: readonly (WebGLFramebuffer | null)[] = [];

  private readonly gl: WebGLRenderingContext;

  public constructor(
    context: GLRenderingDevice, {
      color: rawColors = <TextureView[]>EMPTY_ARR,
      depth: depthTex,
      clearColor = false,
      clearDepth = false,
      clearStencil = false
    }: RenderPassDescriptor = EMPTY
  ) {
    const gl = this.gl = context.gl;
    const drawBuffersExt: WEBGL_draw_buffers | null = context.feature(GL1Feature.DrawBuffers);
    const color = this.color = rawColors.map(initTextureView);
    const depth = this.depth = depthTex ? initTextureView(depthTex) : null;
    const withStencil = depth ? hasStencil(depth.tex.format) : false;
    this.clearColor = clearColor;
    this.clearDepth = clearDepth;
    this.clearStencil = clearStencil;
    
    this.glfb = null;
    const glrfb: (WebGLFramebuffer | null)[] = this.glrfb = [];

    if (color.length) {
      // An offscreen pass, need to create a framebuffer with color- and depth attachments
      this.glfb = gl.createFramebuffer();
      gl.bindFramebuffer(GL_FRAMEBUFFER, this.glfb);
  
      const maxAtt = drawBuffersExt || context.webgl2 ? color.length : 1;
  
      for (let i = 0; i < maxAtt; ++i) {
        if (context.webgl2 && color[i].tex.samples > 1) {
          // Attach multisample renderbuffer for MSAA offscreen rendering
          gl.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + i, GL_RENDERBUFFER,
            (<GLTexture>color[i].tex).glrb);
        } else {
          framebufferTexture(gl, GL_COLOR_ATTACHMENT0 + i, color[i]);
        }
      }
  
      // TODO: [Feature] implement multiview
      if (maxAtt > 1) {
        if (context.webgl2) {
          (<WebGL2RenderingContext>gl).drawBuffers(color.map((_, i) => GL_COLOR_ATTACHMENT0 + i));
        } else if (drawBuffersExt) {
          drawBuffersExt.drawBuffersWEBGL(color.map((_, i) => GL_COLOR_ATTACHMENT0 + i));
        }
      }
  
      // Attach optional depth-stencil buffer to framebuffer
      if (depth) {
        if (depth.tex.renderTarget || (context.webgl2 && depth.tex.samples > 1)) { // Use renderbuffer
          gl.framebufferRenderbuffer(GL_FRAMEBUFFER, withStencil ? GL_DEPTH_STENCIL_ATTACHMENT : GL_DEPTH_ATTACHMENT,
            GL_RENDERBUFFER, (<GLTexture>depth.tex).glrb);
        } else if (isDepthStencil(depth.tex.format)) { // Use depth texture
          framebufferTexture(gl, withStencil ? GL_DEPTH_STENCIL_ATTACHMENT : GL_DEPTH_ATTACHMENT, depth);
        } else {
          if (process.env.DEBUG) {
            console.error('Invalid depth texture format', depth.tex);
          }
        }
      }
  
      if (process.env.DEBUG) {
        console.assert(
          gl.checkFramebufferStatus(GL_FRAMEBUFFER) === GL_FRAMEBUFFER_COMPLETE || gl.isContextLost(),
          'Framebuffer completeness check failed'
        );
      }

      if (context.webgl2) {
        // WebGL has no support for multisample textures. We will render to MSAA renderbuffers
        // and blit to the resolve renderbuffers which have textures attached.
        for (let i = 0; i < maxAtt; ++i) {
          glrfb.push(color[i].tex.samples > 1 ? createResolveFrameBuffer(gl, GL_COLOR_ATTACHMENT0, color[i]) : null);
        }
        glrfb.push(depth && depth.tex.samples > 1 ?
          createResolveFrameBuffer(gl, withStencil ? GL_DEPTH_STENCIL_ATTACHMENT : GL_DEPTH_ATTACHMENT, depth) : null);
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
        blitFramebuffer(<WebGL2RenderingContext>this.gl, this.glfb, this.glrfb[i], this.color[i], GL_COLOR_BUFFER_BIT,
          GL_COLOR_ATTACHMENT0 + i);
      }
    }
    const depthFb = this.glrfb[this.glrfb.length - 1];
    if (this.depth && depthFb) {
      blitFramebuffer(<WebGL2RenderingContext>this.gl, this.glfb, depthFb, this.depth,
        GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    }
  }
}

const initTextureView = (view: TextureView): Required<TextureView> => ({ mipLevel: 0, slice: 0, ...view });

function framebufferTexture(gl: WebGLRenderingContext, attachment: GLenum, texView: Required<TextureView>): void {
  const tex = <GLTexture>texView.tex;
  if (is3DTexture(tex.type)) {
    (<WebGL2RenderingContext>gl)
      .framebufferTextureLayer(GL_FRAMEBUFFER, attachment, tex.glt, texView.mipLevel, texView.slice);
  } else {
    const texTarget = tex.type === GL_TEXTURE_CUBE_MAP ? GL_TEXTURE_CUBE_MAP_POSITIVE_X + texView.slice : tex.type;
    gl.framebufferTexture2D(GL_FRAMEBUFFER, attachment, texTarget, tex.glt, texView.mipLevel);
  }
}

function createResolveFrameBuffer(
  gl: WebGLRenderingContext, attachment: GLenum, texView: Required<TextureView>
): WebGLFramebuffer | null {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(GL_FRAMEBUFFER, fb);
  framebufferTexture(gl, attachment, texView);
  if (process.env.DEBUG) {
    console.assert(
      gl.checkFramebufferStatus(GL_FRAMEBUFFER) === GL_FRAMEBUFFER_COMPLETE || gl.isContextLost,
      'Framebuffer completeness check failed for MSAA resolve buffer'
    );
  }
  return fb;
}

function blitFramebuffer(
  gl2: WebGL2RenderingContext, from: WebGLFramebuffer | null, to: WebGLFramebuffer | null,
  { tex }: Required<TextureView>, mask: number, attachment?: GLenum
): void {
  gl2.bindFramebuffer(GL_READ_FRAMEBUFFER, from);
  gl2.bindFramebuffer(GL_DRAW_FRAMEBUFFER, to);
  if (attachment) {
    gl2.readBuffer(attachment);
  }
  gl2.blitFramebuffer(0, 0, tex.size[0], tex.size[1], 0, 0, tex.size[0], tex.size[1], mask, GL_NEAREST);
}
