const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 960;

const VERT_SHADER_TEXT = `#version 300 es
layout (location = 0) in vec4 in_pos;
layout (location = 1) in vec2 in_uv;
out vec2 bridge_uv;
void main() {
    gl_Position = in_pos;
    bridge_uv = in_uv;
}
`;

const FRAG_SHADER_TEXT = `#version 300 es
precision highp float;
uniform sampler2D tex_sampler;
in vec2 bridge_uv;
out vec4 out_col;
void main() {
    out_col = texture(tex_sampler, bridge_uv);
}
`;

function createBuffer(gl: WebGL2RenderingContext, type: number, typedDataArray: Float32Array | Uint16Array) {
    const buffer = gl.createBuffer();
    if (buffer === null)
        throw new Error("failed to create a buffer.");
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, typedDataArray, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    return buffer;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader === null)
        throw new Error("failed to create a shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error("failed to build a shader.");
    }
    return shader;
}

export class WebGL2App {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    readonly texs: Map<string, WebGLTexture>;

    /// A constructor.
    constructor() {
        // core
        this.canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

        // model
        const vtxs = new Float32Array([
            -0.5, -0.5, 0.0, 1.0,
            0.0, 1.0,
            0.5, -0.5, 0.0, 1.0,
            1.0, 1.0,
            0.5, 0.5, 0.0, 1.0,
            1.0, 0.0,
            -0.5, 0.5, 0.0, 1.0,
            0.0, 0.0,
        ]);
        const idxs = new Uint16Array([0, 1, 2, 0, 2, 3]);
        const vtx_buffer = createBuffer(this.gl, this.gl.ARRAY_BUFFER, vtxs);
        const idx_buffer = createBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, idxs);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vtx_buffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, idx_buffer);

        // program
        const program = this.gl.createProgram();
        if (program === null)
            throw new Error("failed to create a program.");
        this.gl.attachShader(program, createShader(this.gl, this.gl.VERTEX_SHADER, VERT_SHADER_TEXT));
        this.gl.attachShader(program, createShader(this.gl, this.gl.FRAGMENT_SHADER, FRAG_SHADER_TEXT));
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.deleteProgram(program);
            throw new Error("failed to link a program.");
        }
        this.gl.useProgram(program);

        // attribute locations in vertex shader
        this.gl.enableVertexAttribArray(0);
        this.gl.enableVertexAttribArray(1);
        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, stride, 0);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);

        // configure
        this.gl.viewport(0.0, 0.0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.gl.clearColor(0.15, 0.15, 0.15, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // rest
        this.texs = new Map<string, WebGLTexture>();
    }

    /// A method to clear screen.
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /// A method to flush screen.
    flush() {
        this.gl.flush();
    }

    /// A method to draw a square.
    /// TODO: specify much information.
    draw() {
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    /// A method to bind a texture.
    bindTexture(key: string) {
        const tex = this.texs.get(key);
        if (tex === undefined) {
            console.warn("the texture " + key + " undefined");
            return;
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    }

    /// A method to load a bitmap texture from HTMLImageElement.
    loadBitmapTexture(image: HTMLImageElement, key: string) {
        const tex = this.gl.createTexture();
        if (tex === null) {
            console.warn("failed to create a texture for " + key);
            return;
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.texs.set(key, tex);
    }
};
