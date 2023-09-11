import { TVec4 } from '@/util/TVec4'
import { TCamera } from '@/graphics/TCamera'
import { TDrawQuery } from '@/graphics/TDrawQuery'

import { AFragmentShader } from './shader/AFragmentShader'
import { AVertexShader } from './shader/AVertexShader'

import { IRenderer } from '@/graphics/IRenderer'

function expect<T>(value: T | null, emsg: string): T {
  if (value === null)
    throw new Error(emsg)
  else
    return value
}

export class WebGL2 implements IRenderer {
  static readonly CLEAR_COLOR_R = 0.15
  static readonly CLEAR_COLOR_G = 0.15
  static readonly CLEAR_COLOR_B = 0.15

  private readonly gl: WebGL2RenderingContext
  private readonly locInPos: number
  private readonly locInUV: number
  private readonly locUniUV: WebGLUniformLocation
  private readonly locUniCol: WebGLUniformLocation
  private readonly locUniScl: WebGLUniformLocation
  private readonly locUniRot: WebGLUniformLocation
  private readonly locUniTrs: WebGLUniformLocation
  private readonly locUniView: WebGLUniformLocation
  private readonly locUniProj: WebGLUniformLocation
  private readonly texs: Map<string, [WebGLTexture, TVec4]>;

  constructor(canvasWidth: number, canvasHeight: number, vertShader: AVertexShader, fragShader: AFragmentShader) {
    // core
    const canvas = document.getElementById('main-canvas') as HTMLCanvasElement
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    this.gl = expect(
      canvas.getContext('webgl2'),
      '[ error ] WebGL2(): failed to get an WebGL2 rendering context.'
    )

    // model
    // TODO: perhaps it should be split into a separate object.
    const vtxs = new Float32Array([
      -0.5, -0.5, 0.0, 1.0,
      0.0, 1.0,
      0.5, -0.5, 0.0, 1.0,
      1.0, 1.0,
      0.5, 0.5, 0.0, 1.0,
      1.0, 0.0,
      -0.5, 0.5, 0.0, 1.0,
      0.0, 0.0,
    ])
    const idxs = new Uint16Array([0, 1, 2, 0, 2, 3])
    const vtxBuffer = this.createBuffer(this.gl.ARRAY_BUFFER, vtxs)
    const idxBuffer = this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, idxs)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vtxBuffer)
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, idxBuffer)

    // program
    const program = expect(
      this.gl.createProgram(),
      '[ error ] WebGL2(): failed to create a program.'
    )
    this.gl.attachShader(program, vertShader.build(this.gl))
    this.gl.attachShader(program, fragShader.build(this.gl))
    this.gl.linkProgram(program)
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      this.gl.deleteProgram(program)
      throw new Error('[ error ] WebGL2(): failed to link a program.')
    }
    this.gl.useProgram(program)

    // shader configure
    this.locInPos = vertShader.getLocInPos()
    this.locInUV = vertShader.getLocInUV()
    this.locUniUV = vertShader.getLocUniUV(this.gl, program)
    this.locUniCol = vertShader.getLocUniCol(this.gl, program)
    this.locUniScl = vertShader.getLocUniScl(this.gl, program)
    this.locUniRot = vertShader.getLocUniRot(this.gl, program)
    this.locUniTrs = vertShader.getLocUniTrs(this.gl, program)
    this.locUniView = vertShader.getLocUniView(this.gl, program)
    this.locUniProj = vertShader.getLocUniProj(this.gl, program)
    this.gl.enableVertexAttribArray(this.locInPos)
    this.gl.enableVertexAttribArray(this.locInUV)
    const stride = 6 * Float32Array.BYTES_PER_ELEMENT
    this.gl.vertexAttribPointer(this.locInPos, 4, this.gl.FLOAT, false, stride, 0)
    this.gl.vertexAttribPointer(this.locInUV, 2, this.gl.FLOAT, false, stride, 4 * Float32Array.BYTES_PER_ELEMENT)

    // configure
    this.gl.viewport(0.0, 0.0, canvasWidth, canvasHeight)
    this.gl.clearColor(WebGL2.CLEAR_COLOR_R, WebGL2.CLEAR_COLOR_G, WebGL2.CLEAR_COLOR_B, 1.0)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

    // rest
    this.texs = new Map<string, [WebGLTexture, TVec4]>()
  }

  private createBuffer(type: number, typedDataArray: Float32Array | Uint16Array): WebGLBuffer {
    const buffer = expect(
      this.gl.createBuffer(),
      '[ error ] WebGL2.createBuffer(): failed to create a buffer.'
    )
    this.gl.bindBuffer(type, buffer)
    this.gl.bufferData(type, typedDataArray, this.gl.STATIC_DRAW)
    this.gl.bindBuffer(type, null)
    return buffer
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  flush() {
    this.gl.flush()
  }

  draw(q: TDrawQuery) {
    const info = this.texs.get(q.key)
    if (info === undefined) {
      console.log('[ warning ] WebGL2.draw(): info undefined: ' + q.key)
      return
    }
    const [tex, uv] = info
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
    this.gl.uniform4f(this.locUniUV, uv[0], uv[1], uv[2], uv[3])
    this.gl.uniform4f(this.locUniCol, q.col[0], q.col[1], q.col[2], q.col[3])
    this.gl.uniform4f(this.locUniScl, q.scl[0], q.scl[1], 1.0, 1.0)
    this.gl.uniform4f(this.locUniRot, q.rot[0], q.rot[1], q.rot[2], 0.0)
    this.gl.uniform4f(this.locUniTrs, q.trs[0], q.trs[1], q.trs[2], 0.0)
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
  }

  setCamera(camera: TCamera) {
    this.gl.uniformMatrix4fv(this.locUniView, false, camera.view)
    this.gl.uniformMatrix4fv(this.locUniProj, false, camera.proj)
  }

  loadBitmap(url: string, uvs: [string, TVec4][]): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image()
      image.onload = () => {
        const tex = expect(
          this.gl.createTexture(),
          '[ error ] WebGL2.loadBitmap(): failed to create a bitmap texture from ' + url
        )
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)
        this.gl.generateMipmap(this.gl.TEXTURE_2D)
        this.gl.bindTexture(this.gl.TEXTURE_2D, null)
        for (const uv of uvs) {
          this.texs.set(uv[0], [tex, uv[1]])
        }
        resolve()
      }
      image.crossOrigin = 'Anonymous'
      image.src = url
    })
  }
}
