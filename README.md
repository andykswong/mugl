<h1 align="center">█▓▒­░⡷⠂μ ＧＬ⠐⢾░▒▓█</h1>
<h2 align="center">muGL - Micro WebGL Library in AssemblyScript</h2>
<br />
<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a> 
  <a href="https://www.npmjs.com/package/mugl"><img src="https://img.shields.io/npm/v/mugl" alt="NPM" /></a> 
  <a href="https://github.com/andykswong/mugl/actions/workflows/build.yaml"><img src="https://github.com/andykswong/mugl/actions/workflows/build.yaml/badge.svg" alt="build" /></a>
</p>

## Overview

`mugl` is a minimalistic, modular WebGL 3D rendering library in AssemblyScript. It allows you to run the same 3D app on both JavaScript and WebAssembly environments using portable TypeScript/AssemblyScript code.

- **Core module (`mugl`)** : the [rendering device interface](./src/common/device/device.ts) in a simplified [WebGPU](https://gpuweb.github.io/gpuweb/)-style API that removes WebGL state management from you. (**10KB** in size)
  - **Nano device (`mugl/n` aka `ngl`)**: **3KB** WebGL1 implementation of the rendering device interface. You can even turn off some [features](./src/js/nano/config.ts) that you do not need (e.g. scissor, stencil testing) to reduce the size to **2KB**!
- **glTF module (`mugl/tf`) (WIP)**: a minimalistic glTF 2.0 model loader and renderer (**11KB** in size)

*\* File sizes are measured from minified and gzipped UMD Webpack library bundles. Actual size can be even smaller, by using a module bundler with tree shaking.*

## [glTF 2.0 Model Viewer](http://andykswong.github.io/mugl/examples/gltf.html) (WIP)
A minimal **13KB** (gzipped) glTF model viewer built on `mugl` is available as an [example](http://andykswong.github.io/mugl/examples/gltf.html) usage of this library. The source code can be found [here](./examples/gltf-viewer).

Any model from [glTF-Sample-Models](https://github.com/KhronosGroup/glTF-Sample-Models) can be loaded using the `model` and `variant` URL parameter, e.g.: [?model=Buggy&variant=glTF-Binary](http://andykswong.github.io/mugl/examples/gltf.html?model=Buggy&variant=glTF-Binary&camera=0&scene=0) to load the [Buggy](https://github.com/KhronosGroup/glTF-Sample-Models/tree/master/2.0/Buggy) model. You can also use the `url` URL parameter to load a model from any source ([example](http://andykswong.github.io/mugl/examples/gltf.html?url=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf)).

![alt text](./screenshots/DamagedHelmet.png)

## Install
```shell
npm install --save mugl
```

## Usage

### 0. GlTF 2.0 Rendering
Below is the minimum setup required to render a GlTF 2.0 model:

```javascript
import { getGLDevice } from 'mugl';
import { renderGlTF, resolveGlTF } from 'mugl/tf';

// 1. Create WebGL rendering device from an existing canvas
const device = getGLDevice(canvas);
if (!device) throw new Error('WebGL is unsupported');

// 2. Async load a GlTF/GLB file
const glTFPromise = resolveGlTF({ uri: 'DamagedHelmet.gltf' });

// 3. Render the GlTF model
glTFPromise.then(glTF => {
  renderGlTF(device, glTF);
});
```

### 1. Basic Rendering Example
Below is a simple `mugl` program to draw a triangle (See this example live [here](https://andykswong.github.io/mugl/examples/#basic)):

```javascript
import { getGLDevice, VertexFormat } from 'mugl';

// 0. Prepare triangle vertex positions and colors data
const triangle = new Float32Array([
  // position  color
  0.0, 0.5,    1.0, 0.0, 0.0, 1.0,
  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
  -0.5, -0.5,  0.0, 0.0, 1.0, 1.0,
]);

// 1. Create WebGL rendering device from an existing canvas
const device = getGLDevice(canvas);
if (!device) throw new Error('WebGL is unsupported');

// 2. Create GPU buffer for the triangle data
const buffer = device.buffer({ size: triangle.byteLength }).data(triangle);

// 3. Compiler the vertex and fragment shaders
const vert = this.device.shader({
  type: ShaderType.Vertex,
  source: `
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
    }`
});
const frag = this.device.shader({
  type: ShaderType.Fragment,
  source: `
    varying lowp vec4 vColor;
    void main () {
      gl_FragColor = vColor;
    }`
});

// 4. Create pipeline object for drawing the triangle
const pipeline = device.pipeline({
  vert,
  frag,
  buffers: [{
    attrs: [
      { name: 'position', format: VertexFormat.Float2 },
      { name: 'color', format: VertexFormat.Float4 }
    ]
  }],
  uniforms: [ { name: 'angle' } ]
});

// 5. Create default render pass object
const pass = device.pass();

// 6. Submit draw call in a render pass
device
  .render(pass)
    .pipeline(pipeline)
    .vertex(0, buffer)
    .uniforms([ { name: 'angle', value: Math.PI / 2 } ])
    .draw(3)
  .end();
```

### 2. Using the Nano Implementation
To use the Nano Implementation, use `getNGLDevice` to create a device:

```javascript
import { getNGLDevice } from 'mugl/n';

const device = getNGLDevice(canvas);
```

## [More Examples](http://andykswong.github.io/mugl/examples)
Check out the [live examples](http://andykswong.github.io/mugl/examples). The source code of all examples can be found [here](https://github.com/andykswong/mugl/tree/main/src/examples).

## API
TSDoc: http://andykswong.github.io/mugl

## License
This repository and the code inside it is licensed under the MIT License. Read [LICENSE](./LICENSE) for more information.
