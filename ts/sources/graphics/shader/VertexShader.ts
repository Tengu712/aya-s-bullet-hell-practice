import { AVertexShader } from "./AVertexShader"

export class VertexShader extends AVertexShader {
  getLocInPos(): number {
    return 0
  }
  getLocInUV(): number {
    return 1
  }
  
  protected getNameUniUV(): string {
    return 'uni_uv'
  }
  protected getNameUniCol(): string {
    return 'uni_col'
  }
  protected getNameUniScl(): string {
    return 'uni_scl'
  }
  protected getNameUniRot(): string {
    return 'uni_rot'
  }
  protected getNameUniTrs(): string {
    return 'uni_trs'
  }
  protected getNameUniView(): string {
    return 'uni_view'
  }
  protected getNameUniProj(): string {
    return 'uni_proj'
  }

  protected getText(): string {
    return `#version 300 es
    layout (location = 0) in vec4 in_pos;
    layout (location = 1) in vec2 in_uv;
    
    uniform vec4 uni_uv;
    uniform vec4 uni_col;
    uniform vec4 uni_scl;
    uniform vec4 uni_rot;
    uniform vec4 uni_trs;
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
      pos = pos + uni_trs;
      pos = uni_view * pos;
      pos = uni_proj * pos;
      gl_Position = pos;
    
      bridge_uv = vec2(
        uni_uv.x + (uni_uv.z - uni_uv.x) * in_uv.x,
        uni_uv.y + (uni_uv.w - uni_uv.y) * in_uv.y
      );
    
      bridge_col = uni_col;
    }`
  }
}