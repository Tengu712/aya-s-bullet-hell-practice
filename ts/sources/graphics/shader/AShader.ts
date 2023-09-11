/// [Template Method Pattern]
export abstract class AShader {
  protected abstract getType(): number
  protected abstract getText(): string

  build(gl: WebGL2RenderingContext): WebGLShader {
    const shader = gl.createShader(this.getType())
    if (shader === null)
      throw new Error('[ error ] AShader.build(): failed to create a shader.')

    gl.shaderSource(shader, this.getText())
    gl.compileShader(shader)
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)
      throw new Error('[ error ] AShader.build(): failed to compile a shader.')
    }
    return shader
  }
}
