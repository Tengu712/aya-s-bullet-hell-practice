export const VERT_SHADER_TEXT = `#version 300 es
layout (location = 0) in vec4 in_pos;
layout (location = 1) in vec2 in_uv;

uniform vec4 uni_uv;
uniform vec4 uni_col;
uniform vec4 uni_scl;
uniform vec4 uni_rot;
uniform vec4 uni_pos;
uniform mat4 uni_view;
uniform mat4 uni_proj;

out vec2 bridge_uv;
out vec4 bridge_col;

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

    bridge_col = uni_col;
}
`;

export const FRAG_SHADER_TEXT = `#version 300 es
precision highp float;

uniform sampler2D tex_sampler;

in vec2 bridge_uv;
in vec4 bridge_col;

out vec4 out_col;

void main() {
    out_col = texture(tex_sampler, bridge_uv) * bridge_col;
}
`;

export const LOC_IN_POS: number = 0;
export const LOC_IN_UV: number = 1;

export function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader === null)
        throw new Error('failed to create a shader.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('failed to build a shader.');
    }
    return shader;
}

export function getUniLoc(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
    const res = gl.getUniformLocation(program, name);
    if (res !== null)
        return res;
    else
        throw new Error('failed to get the location of the uniform ' + name + '.');
}
