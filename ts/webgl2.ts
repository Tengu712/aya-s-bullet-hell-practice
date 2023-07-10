export type Rect = {
    left: number,
    top: number,
    right: number,
    bottom: number,
};

const VERT_SHADER_TEXT = `#version 300 es
in vec4 in_pos;
void main() {
  gl_Position = in_pos;
}
`;

const FRAG_SHADER_TEXT = `#version 300 es
precision highp float;
out vec4 out_col;
void main() {
  out_col = vec4(1.0, 0.0, 0.5, 1.0);
}
`;

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

    /// A constructor.
    constructor() {
        // 
        this.canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
        this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext;

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

        // attribute locations in vertex shader
        const attrloc_in_pos = this.gl.getAttribLocation(program, 'in_pos');

        // configure
        this.gl.viewport(0.0, 0.0, 1280.0, 960.0);
        this.gl.clearColor(0.15, 0.15, 0.15, 1.0);
        this.gl.useProgram(program);
    }

    /// A method to draw.
    draw() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /// A method to get positions of canvas corners.
    getCanvasCorners(): Rect {
        const client_rect = this.canvas.getBoundingClientRect();
        const x = window.scrollX + client_rect.left;
        const y = window.scrollY + client_rect.top;
        return {
            left: x,
            top: y,
            right: x + 1280.0,
            bottom: y + 960.0,
        };
    }
};
