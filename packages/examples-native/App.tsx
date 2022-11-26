import { Asset } from 'expo-asset';
import { Platform, StyleSheet, View } from 'react-native';
import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { BindingType, BufferUsage, Extent2D, FilterMode, ShaderStage, vertexBufferLayouts, VertexFormat, WebGL } from 'mugl';

const CANVAS_SIZE = { width: 300, height: 300 } as const;

export default function App() {
  return (
    <View style={styles.container}>
      <GLView style={CANVAS_SIZE} onContextCreate={onContextCreate} />
    </View>
  );
}

async function onContextCreate(gl: ExpoWebGLRenderingContext) {
  const canvas = { getContext() { return gl; }, ...CANVAS_SIZE };
  const device = WebGL.requestWebGL2Device(canvas);

  const pipeline = WebGL.createRenderPipeline(device, {
    vertex: WebGL.createShader(device, { code: vert, usage: ShaderStage.Vertex }),
    fragment: WebGL.createShader(device, { code: frag, usage: ShaderStage.Fragment }),
    buffers: vertexBufferLayouts([
      { attributes: [/* position */ VertexFormat.F32x3, /* uv */ VertexFormat.F32x2] }
    ]),
  });

  const asset = await Asset.fromModule(require('./airplane.png')).downloadAsync();
  const image = await getImageForAsset(asset);
  const size = [512, 512] as Extent2D;
  const texture = WebGL.createTexture(device, { size: [...size, 1] });
  WebGL.copyExternalImageToTexture(device, { src: image }, { texture }, size);
  const sampler = WebGL.createSampler(device, { magFilter: FilterMode.Linear, minFilter: FilterMode.Linear });
  const layout = WebGL.createBindGroupLayout(device, {
    entries: [
      { label: 'tex', type: BindingType.Texture, binding: 0 },
      { label: 'tex', type: BindingType.Sampler, binding: 1 },
    ]
  });
  const bindgroup = WebGL.createBindGroup(device, { layout, entries: [{ texture }, { sampler }] });

  const buffer = WebGL.createBuffer(device, { usage: BufferUsage.Vertex, size: vertices.byteLength });
  WebGL.writeBuffer(device, buffer, vertices);

  WebGL.beginDefaultPass(device, { clearColor: [0.1, 0.2, 0.3, 1.0] });
  {
    WebGL.setRenderPipeline(device, pipeline);
    WebGL.setVertex(device, 0, buffer);
    WebGL.setBindGroup(device, 0, bindgroup);
    WebGL.draw(device, 3);
  }
  WebGL.submitRenderPass(device);

  gl.endFrameEXP();
}

async function getImageForAsset(asset: Asset): Promise<TexImageSource> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = asset.localUri || asset.uri || '';
    });
  }
  return asset as unknown as TexImageSource;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const vertices = new Float32Array([
  // pos           uv
  0.0, 0.5, 0.0, 0.5, 1.0,
  0.5, -0.5, 0.0, 1.0, 0.0,
  -0.5, -0.5, 0.0, 0.0, 0.0,
]);

const vert = `#version 300 es
layout (location=0) in vec3 position;
layout (location=1) in vec2 uv;
out vec2 ouv;
void main () {
  gl_Position = vec4(position, 1);
  ouv = uv;
}
`;

const frag = `#version 300 es
precision mediump float;
in vec2 ouv;
uniform sampler2D tex;
out vec4 color;
void main () {
  color = texture(tex, ouv);
}
`;
