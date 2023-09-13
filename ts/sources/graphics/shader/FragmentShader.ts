import { AFragmentShader } from "./AFragmentShader"

export class FragmentShader extends AFragmentShader {
  getType(): number {
    return WebGL2RenderingContext.FRAGMENT_SHADER
  }

  getText(): string {
    return `#version 300 es
    precision highp float;
    
    uniform sampler2D tex_sampler;
    
    in vec2 bridge_uv;
    in vec4 bridge_col;
    
    out vec4 out_col;
    
    void main() {
      out_col = texture(tex_sampler, bridge_uv) * bridge_col;
    }`
  }
}
