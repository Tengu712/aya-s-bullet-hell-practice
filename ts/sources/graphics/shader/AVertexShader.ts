import { AShader } from "./AShader"

/// [Template Method Pattern]
export abstract class AVertexShader extends AShader {
  abstract getLocInPos(): number
  abstract getLocInUV(): number

  protected abstract getNameUniUV(): string
  protected abstract getNameUniCol(): string
  protected abstract getNameUniScl(): string
  protected abstract getNameUniRot(): string
  protected abstract getNameUniTrs(): string
  protected abstract getNameUniView(): string
  protected abstract getNameUniProj(): string

  protected getType(): number {
    return WebGL2RenderingContext.VERTEX_SHADER
  }

  getLocUniUV(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniUV())
  }
  getLocUniCol(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniCol())
  }
  getLocUniScl(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniScl())
  }
  getLocUniRot(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniRot())
  }
  getLocUniTrs(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniTrs())
  }
  getLocUniView(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniView())
  }
  getLocUniProj(gl: WebGL2RenderingContext, program: WebGLProgram): WebGLUniformLocation {
    return this.getLocUni(gl, program, this.getNameUniProj())
  }
  private getLocUni(gl: WebGL2RenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
    const res = gl.getUniformLocation(program, name)
    if (res === null)
      throw new Error('[ error ] AVertexShader.getLocUni(): failed to get an uniform location: ' + name + '.')
    else
      return res
  }
}
