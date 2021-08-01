import { lookAt, mat4, perspective, scale } from 'munum';
import {
  Buffer, BufferType, CompareFunc, CullMode, RenderingDevice, VertexFormat, PixelFormat, TexType, AddressMode,
  MinFilterMode, UniformFormat, UniformType, PipelineDescriptor, ShaderType, Float, Pipeline, RenderPass, Texture
} from 'mugl';
import { BaseExample, createBuffer, Cube, getImageById, Model, TEX_SIZE, toIndices, toVertices, USE_NGL } from '../common';
import { airplane, skyBox } from '../images';

const texSize = TEX_SIZE;

// Double the cube UVs for repeating effect
const cubeUvs: Float[][] = [];
for (let i = 0; i < Cube.uvs!.length; ++i) {
  const uv = Cube.uvs![i];
  cubeUvs.push([uv[0] * 2, uv[1] * 2]);
}
const cubeVertices = toVertices({
  positions: Cube.positions,
  uvs: cubeUvs
} as Model);
const cubeIndices = toIndices(Cube);

const vert = `
precision mediump float;
uniform mat4 mvp;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
varying vec3 vNormal;
void main(void) {
  vUv = uv;
  vNormal = normalize(position);
  gl_Position = mvp * vec4(position, 1.0);
}
`;

const fragCube = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D tex;
void main () {
  gl_FragColor = texture2D(tex, vUv);
}
`;

const fragSky = `
precision mediump float;
varying vec3 vNormal;
uniform samplerCube tex;
void main () {
  gl_FragColor = textureCube(tex, normalize(vNormal));
}
`;

export class TextureExample extends BaseExample {
  pass: RenderPass | null = null;
  vertBuffer: Buffer | null = null;
  indexBuffer: Buffer | null = null;
  cubePipeline: Pipeline | null = null;
  cubeTex: Texture | null = null;
  skyPipeline: Pipeline | null = null;
  skyTex: Texture | null = null;

  constructor(private readonly device: RenderingDevice) {
    super();
  }

  init(): void {
    // Get texture images
    const airplane = getImageById('airplane');
    const sky0 = getImageById('sky0');
    const sky1 = getImageById('sky1');
    const sky2 = getImageById('sky2');

    const ctx = this.device;

    const vs = this.device.shader({ type: ShaderType.Vertex, source: vert });
    const cubeFs = this.device.shader({ type: ShaderType.Fragment, source: fragCube });
    const skyFs = this.device.shader({ type: ShaderType.Fragment, source: fragSky });

    this.vertBuffer = createBuffer(ctx, cubeVertices);
    this.indexBuffer = createBuffer(ctx, cubeIndices, BufferType.Index);

    // Setup the cube
    this.cubeTex = ctx.texture({
      type: TexType.Tex2D,
      format: PixelFormat.RGBA8,
      width: texSize,
      height: texSize
    }, {
      minFilter: MinFilterMode.LinearMipmapLinear,
      wrapU: AddressMode.Repeat,
      wrapV: AddressMode.Repeat,
      maxAniso: 16
    });
    if (airplane) {
      this.cubeTex!
        .data({ image: airplane })
        .mipmap();
    }

    const cubePipelineDesc: PipelineDescriptor = {
      vert: vs,
      frag: cubeFs,
      buffers: [
        {
          attrs: [
            { name: 'position', format: VertexFormat.Float3 },
            { name: 'uv', format: VertexFormat.Float2 }
          ]
        }
      ],
      uniforms: [
        { name: 'mvp', valueFormat: UniformFormat.Mat4 },
        { name: 'tex', type: UniformType.Tex, texType: this.cubeTex!.props.type },
      ],
      depth: {
        compare: CompareFunc.LEqual,
        write: true
      },
      raster: {
        cullMode: CullMode.Back
      }
    };
    this.cubePipeline = ctx.pipeline(cubePipelineDesc);

    // Setup the sky box (Cube texture not supported for NGL)
    if (!USE_NGL) {
      this.skyTex = ctx.texture({
        type: TexType.Cube,
        format: PixelFormat.RGBA8,
        width: texSize,
        height: texSize
      });
      if (sky0 && sky1 && sky2) {
        this.skyTex!
          .data({ images: [sky0, sky0, sky1, sky2, sky0, sky0] })
          .mipmap();
      }

      this.skyPipeline = ctx.pipeline({
        buffers: cubePipelineDesc.buffers,
        depth: cubePipelineDesc.depth,
        vert: vs,
        frag: skyFs,
        uniforms: [
          { name: 'mvp', valueFormat: UniformFormat.Mat4 },
          { name: 'tex', type: UniformType.Tex, texType: this.skyTex!.props.type },
        ],
        raster: {
          cullMode: CullMode.Front // Render back face for sky box
        }
      });
    }

    this.pass = ctx.pass({
      clearColor: [0.3, 0.3, 0.3, 1],
      clearDepth: 1
    });

    this.register([
      this.pass!, this.vertBuffer!,
      this.cubePipeline!, this.indexBuffer!, this.cubeTex!,
      vs, cubeFs, skyFs
    ]);
    if (this.skyPipeline) {
      this.register([this.skyPipeline!, this.skyTex!]);
    }
  }

  render(t: Float): boolean {
    const proj = perspective((this.device.width  as Float) / (this.device.height  as Float), Math.PI / 4 as Float, 0.01, 100);
    const view = lookAt([10 * Math.cos(t) as Float, 5 * Math.sin(t) as Float, 10 * Math.sin(t) as Float], [0, 0, 0]);
    const vp = mat4.mul(proj, view);

    const ctx = this.device.render(this.pass!);

    // Draw cube
    let mvp = vp; // Cube at (0, 0, 0)
    ctx.pipeline(this.cubePipeline!)
      .vertex(0, this.vertBuffer!)
      .index(this.indexBuffer!)
      .uniforms([
        { name: 'mvp', values: mvp },
        { name: 'tex', tex: this.cubeTex },
      ])
      .drawIndexed(cubeIndices.length);

    // Draw skybox
    if (this.skyPipeline) {
      mvp = mat4.mul(vp, scale([10, 10, 10]), vp);  // Make the skybox bigger
      ctx.pipeline(this.skyPipeline!)
        .vertex(0, this.vertBuffer!)
        .index(this.indexBuffer!)
        .uniforms([
          { name: 'mvp', values: mvp },
          { name: 'tex', tex: this.skyTex },
        ])
        .drawIndexed(cubeIndices.length)
        .end();
    }

    return true;
  }
}
