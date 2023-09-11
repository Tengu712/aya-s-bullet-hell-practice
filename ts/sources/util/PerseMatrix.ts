export class PerseMatrix {
  private readonly data: Float32Array

  constructor(pov: number, aspect: number, near: number, far: number) {
    const div_tanpov = 1.0 / Math.tan(Math.PI * pov / 180.0)
    const div_depth = 1.0 / (far - near)
    this.data = new Float32Array([
      div_tanpov, 0.0, 0.0, 0.0,
      0.0, div_tanpov * aspect, 0.0, 0.0,
      0.0, 0.0, far * div_depth, 1.0,
      0.0, 0.0, -far * near * div_depth, 0.0,
    ])
  }

  build(): Float32Array {
    return this.data
  }
}