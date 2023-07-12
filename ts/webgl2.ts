import { DrawQuery } from "./webgl2/dquery";
import * as Shader from "./webgl2/shader";

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 960;

function createBuffer(gl: WebGL2RenderingContext, type: number, typedDataArray: Float32Array | Uint16Array) {
    const buffer = gl.createBuffer();
    if (buffer === null)
        throw new Error("failed to create a buffer.");
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, typedDataArray, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    return buffer;
}

export class WebGL2App {
    private readonly canvas: HTMLCanvasElement;
    private readonly gl: WebGL2RenderingContext;
    private readonly texs: Map<string, WebGLTexture>;
    private readonly uvs: Map<string, [number, number, number, number]>;
    private readonly loc_uni_uv: WebGLUniformLocation;
    private readonly loc_uni_col: WebGLUniformLocation;
    private readonly loc_uni_scl: WebGLUniformLocation;
    private readonly loc_uni_rot: WebGLUniformLocation;
    private readonly loc_uni_pos: WebGLUniformLocation;
    private readonly loc_uni_view: WebGLUniformLocation;
    private readonly loc_uni_proj: WebGLUniformLocation;

    /// A constructor.
    public constructor() {
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
        this.gl.attachShader(program, Shader.createShader(this.gl, this.gl.VERTEX_SHADER, Shader.VERT_SHADER_TEXT));
        this.gl.attachShader(program, Shader.createShader(this.gl, this.gl.FRAGMENT_SHADER, Shader.FRAG_SHADER_TEXT));
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.deleteProgram(program);
            throw new Error("failed to link a program.");
        }
        this.gl.useProgram(program);

        // shader configure
        this.loc_uni_uv = Shader.getUniLoc(this.gl, program, 'uni_uv');
        this.loc_uni_col = Shader.getUniLoc(this.gl, program, 'uni_col');
        this.loc_uni_scl = Shader.getUniLoc(this.gl, program, 'uni_scl');
        this.loc_uni_rot = Shader.getUniLoc(this.gl, program, 'uni_rot');
        this.loc_uni_pos = Shader.getUniLoc(this.gl, program, 'uni_pos');
        this.loc_uni_view = Shader.getUniLoc(this.gl, program, 'uni_view');
        this.loc_uni_proj = Shader.getUniLoc(this.gl, program, 'uni_proj');
        this.gl.enableVertexAttribArray(Shader.LOC_IN_POS);
        this.gl.enableVertexAttribArray(Shader.LOC_IN_UV);
        const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(Shader.LOC_IN_POS, 4, this.gl.FLOAT, false, stride, 0);
        this.gl.vertexAttribPointer(Shader.LOC_IN_UV, 2, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT);

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
    public clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /// A method to flush screen.
    public flush() {
        this.gl.flush();
    }

    /// A method to draw a square.
    public draw(q: DrawQuery) {
        const uv = this.uvs.get(q.uv_key);
        if (uv !== undefined)
            this.gl.uniform4f(this.loc_uni_uv, uv[0], uv[1], uv[2], uv[3]);
        else
            console.warn("uv " + q.uv_key + " undefined.");
        this.gl.uniform4f(this.loc_uni_col, q.col[0], q.col[1], q.col[2], q.col[3]);
        this.gl.uniform4f(this.loc_uni_scl, q.scl[0], q.scl[1], 1.0, 1.0);
        this.gl.uniform4f(this.loc_uni_rot, q.rot[0], q.rot[1], q.rot[2], 0.0);
        this.gl.uniform4f(this.loc_uni_pos, q.trs[0], q.trs[1], q.trs[2], 0.0);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    /// A method to set a camera.
    public view(pos: [number, number, number], rot: [number, number, number]) {
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
    public perse(pov: number, aspect: number, near: number, far: number) {
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
    public ortho(width: number, height: number, depth: number) {
        const mat = new Float32Array([
            2.0 / width, 0.0, 0.0, 0.0,
            0.0, 2.0 / height, 0.0, 0.0,
            0.0, 0.0, 1.0 / depth, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);
        this.gl.uniformMatrix4fv(this.loc_uni_proj, false, mat);
    }

    /// A method to bind a texture.
    public bindTexture(key: string) {
        const tex = this.texs.get(key);
        if (tex !== undefined)
            this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        else
            console.warn("the texture " + key + " undefined");
    }

    /// A method to load a bitmap texture from HTMLImageElement.
    public loadBitmapTexture(image: HTMLImageElement, key: string) {
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
    public setUVs(uvs: [string, [number, number, number, number]][]) {
        for (const n of uvs) {
            this.uvs.set(n[0], n[1]);
        }
    }
};
