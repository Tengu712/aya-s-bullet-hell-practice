export class OrthoMatrix {
  private readonly data: Float32Array

  constructor(width: number, height: number, depth: number) {
    this.data = new Float32Array([
      2.0 / width, 0.0, 0.0, 0.0,
      0.0, 2.0 / height, 0.0, 0.0,
      0.0, 0.0, 1.0 / depth, 0.0,
      0.0, 0.0, 0.0, 1.0,
    ])
  }

  build(): Float32Array {
    return this.data
  }
}
