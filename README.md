# mugl - μGL

[![NPM](https://img.shields.io/npm/v/mugl)](https://www.npmjs.com/package/mugl) [![build](https://github.com/andykswong/mugl/actions/workflows/build.yaml/badge.svg)](https://github.com/andykswong/mugl/actions/workflows/build.yaml)

> A micro, modern WebGL wrapper library in TypeScript.

`mugl` provides a minimalistic 3D rendering API in [WebGPU](https://gpuweb.github.io/gpuweb/)-style that removes WebGL state management from you. With `mugl`, you use a simple [rendering device interface](https://andykswong.github.io/mugl/interfaces/renderingdevice.html) to allocate resources, such as buffers and textures, and submit draw calls to GPU.

## Install
```shell
npm install --save mugl
```

## Usage
Below is a simple `mugl` program to draw a triangle:
```javascript
import { UniformFormat, UniformType, VertexFormat, getGLDevice } from 'mugl';

// 0. Prepare triangle vertex positions and colors data
const triangle = new Float32Array([
  // position  color
  0.0, 0.5,    1.0, 0.0, 0.0, 1.0,
  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
  -0.5, -0.5,  0.0, 0.0, 1.0, 1.0,
]);

// 1. Create WebGL rendering device from an existing canvas
const device = getGLDevice(canvas);
if(!device) throw new Error('WebGL is unsupported');

// 2. Create GPU buffer for the triangle data
const buffer = device.buffer({ size: triangle.byteLength }).data(triangle);

// 3. Create pipeline object for drawing the triangle
const pipeline = device.pipeline({
  vert: `
    uniform float angle;
    attribute vec2 position;
    attribute vec4 color;
    varying lowp vec4 vColor;
    void main () {
      gl_Position = vec4(
        cos(angle) * position.x - sin(angle) * position.y,
        sin(angle) * position.x + cos(angle) * position.y,
        0, 1);
      vColor = color;
    }`,
  frag: `
    varying lowp vec4 vColor;
    void main () {
      gl_FragColor = vColor;
    }`,
  buffers: [{
    attrs: [
      { name: 'position', format: VertexFormat.Float2 },
      { name: 'color', format: VertexFormat.Float4 }
    ]
  }],
  uniforms: {
    'angle': { type: UniformType.Value, format: UniformFormat.Float }
  }
});

// 4. Create default render pass object
const pass = device.pass();

// 5. Submit draw call in a render pass
device
  .render(pass)
    .pipeline(pipeline)
    .vertex(0, buffer)
    .uniforms({ 'angle': Math.PI / 2 })
    .draw(3)
  .end();
```

See this example [live](https://andykswong.github.io/mugl/examples/#basic)

## More Examples
Check out the [live examples](http://andykswong.github.io/mugl/examples). The source code of all examples can be found [here](https://github.com/andykswong/mugl/tree/main/src/examples).

## API
TSDoc: http://andykswong.github.io/mugl

## License
This repository and the code inside it is licensed under the MIT License. Read [LICENSE](./LICENSE) for more information.
