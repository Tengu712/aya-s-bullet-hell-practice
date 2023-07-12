export type DrawQuery = {
    uv_key: string,
    scl: [number, number],
    rot: [number, number, number],
    trs: [number, number, number],
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 960;

const VERT_SHADER_TEXT = `#version 300 es
layout (location = 0) in vec4 in_pos;
layout (location = 1) in vec2 in_uv;
uniform vec4 uni_uv;
uniform vec4 uni_scl;
uniform vec4 uni_rot;
uniform vec4 uni_pos;
uniform mat4 uni_view;
uniform mat4 uni_proj;
out vec2 bridge_uv;
void main() {
    vec4 pos = in_pos;
    pos = pos * uni_scl;
    float sr = sin(uni_rot.x);
    float sp = sin(uni_rot.y);
    float sy = sin(uni_rot.z);
    float cr = cos(uni_rot.x);
    float cp = cos(uni_rot.y);
    float cy = cos(uni_rot.z);
    pos = mat4(
        // col 1
        cp * cy,
        -cp * sy,
        sp,
        0.0,
        // col 2
        cr * sy + sr * sp * cy,
        cr * cy - sr * sp * sy,
        -sr * cp,
        0.0,
        // col 3
        sr * sy - cr * sp * cy,
        sr * cy + cr * sp * sy,
        cr * cp,
        0.0,
        // col 4
        0.0,
        0.0,
        0.0,
        1.0
    ) * pos;
    pos = pos + uni_pos;
    pos = uni_view * pos;
    pos = uni_proj * pos;
    gl_Position = pos;
    bridge_uv = vec2(
        uni_uv.x + (uni_uv.z - uni_uv.x) * in_uv.x,
        uni_uv.y + (uni_uv.w - uni_uv.y) * in_uv.y
    );
}
`;
const LOC_IN_POS: number = 0;
const LOC_IN_UV: number = 1;

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
    readonly uvs: Map<string, [number, number, number, number]>;
    readonly loc_uni_uv: WebGLUniformLocation;
    readonly loc_uni_scl: WebGLUniformLocation;
    readonly loc_uni_rot: WebGLUniformLocation;
    readonly loc_uni_pos: WebGLUniformLocation;
    readonly loc_uni_view: WebGLUniformLocation;
    readonly loc_uni_proj: WebGLUniformLocation;

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

        // shader configure
        this.loc_uni_uv = this.gl.getUniformLocation(program, 'uni_uv') as WebGLUniformLocation; // HACK: without type assertion.
        this.loc_uni_scl = this.gl.getUniformLocation(program, 'uni_scl') as WebGLUniformLocation; // HACK: without type assertion.
        this.loc_uni_rot = this.gl.getUniformLocation(program, 'uni_rot') as WebGLUniformLocation; // HACK: without type assertion.
        this.loc_uni_pos = this.gl.getUniformLocation(program, 'uni_pos') as WebGLUniformLocation; // HACK: without type assertion.
        this.loc_uni_view = this.gl.getUniformLocation(program, 'uni_view') as WebGLUniformLocation; // HACK: without type assertion.
        this.loc_uni_proj = this.gl.getUniformLocation(program, 'uni_proj') as WebGLUniformLocation; // HACK: without type assertion.
        this.gl.enableVertexAttribArray(LOC_IN_POS);
        this.gl.enableVertexAttribArray(LOC_IN_UV);
        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(LOC_IN_POS, 4, this.gl.FLOAT, false, stride, 0);
        this.gl.vertexAttribPointer(LOC_IN_UV, 2, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);

        // configure
        this.gl.viewport(0.0, 0.0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.gl.clearColor(0.15, 0.15, 0.15, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.view([0.0, 0.0, CANVAS_WIDTH / -2.0], [0.0, 0.0, 0.0]);
        this.perse(45.0, CANVAS_WIDTH / CANVAS_HEIGHT, 0.0, 1000.0);

        // rest
        this.texs = new Map<string, WebGLTexture>();
        this.uvs = new Map<string, [number, number, number, number]>();
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
    draw(q: DrawQuery) {
        const uv = this.uvs.get(q.uv_key);
        if (uv !== undefined)
            this.gl.uniform4f(this.loc_uni_uv, uv[0], uv[1], uv[2], uv[3]);
        else
            console.warn("uv " + q.uv_key + " undefined.");
        this.gl.uniform4f(this.loc_uni_scl, q.scl[0], q.scl[1], 1.0, 1.0);
        this.gl.uniform4f(this.loc_uni_rot, q.rot[0], q.rot[1], q.rot[2], 0.0);
        this.gl.uniform4f(this.loc_uni_pos, q.trs[0], q.trs[1], q.trs[2], 0.0);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    /// A method to set a camera.
    view(pos: [number, number, number], rot: [number, number, number]) {
        const sr = Math.sin(-rot[0]);
        const sp = Math.sin(-rot[1]);
        const sy = Math.sin(-rot[2]);
        const cr = Math.cos(-rot[0]);
        const cp = Math.cos(-rot[1]);
        const cy = Math.cos(-rot[2]);
        const mat = new Float32Array([
            // col 1
            cp * cy,
            -cp * sy,
            sp,
            0.0,
            // col 2
            cr * sy + sr * sp * cy,
            cr * cy - sr * sp * sy,
            -sr * cp,
            0.0,
            // col 3
            sr * sy - cr * sp * cy,
            sr * cy + cr * sp * sy,
            cr * cp,
            0.0,
            // col 4
            -pos[0],
            -pos[1],
            -pos[2],
            1.0,
        ]);
        this.gl.uniformMatrix4fv(this.loc_uni_view, false, mat);
    }

    /// A method to set a perse proj.
    perse(pov: number, aspect: number, near: number, far: number) {
        const div_tanpov = 1.0 / Math.tan(Math.PI * pov / 180.0);
        const div_depth = 1.0 / (far - near);
        const mat = new Float32Array([
            div_tanpov, 0.0, 0.0, 0.0,
            0.0, div_tanpov * aspect, 0.0, 0.0,
            0.0, 0.0, far * div_depth, 1.0,
            0.0, 0.0, -far * near * div_depth, 0.0,
        ]);
        this.gl.uniformMatrix4fv(this.loc_uni_proj, false, mat);
    }

    /// A method to set a ortho proj.
    ortho(width: number, height: number, depth: number) {
        const mat = new Float32Array([
            2.0 / width, 0.0, 0.0, 0.0,
            0.0, 2.0 / height, 0.0, 0.0,
            0.0, 0.0, 1.0 / depth, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);
        this.gl.uniformMatrix4fv(this.loc_uni_proj, false, mat);
    }

    /// A method to bind a texture.
    bindTexture(key: string) {
        const tex = this.texs.get(key);
        if (tex !== undefined)
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        else
            console.warn("the texture " + key + " undefined");
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

    /// A method to set UVs.
    setUVs(uvs: [string, [number, number, number, number]][]) {
        for (const n of uvs) {
            this.uvs.set(n[0], n[1]);
        }
    }
};
