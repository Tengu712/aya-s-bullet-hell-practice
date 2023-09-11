import { TVec3 } from "@/util/TVec3"

export class ViewMatrix {
  private readonly data: Float32Array

  constructor(pos: TVec3, rot: TVec3) {
    const sr = Math.sin(-rot[0])
    const sp = Math.sin(-rot[1])
    const sy = Math.sin(-rot[2])
    const cr = Math.cos(-rot[0])
    const cp = Math.cos(-rot[1])
    const cy = Math.cos(-rot[2])
    this.data = new Float32Array([
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
    ])
  }

  build(): Float32Array {
    return this.data
  }
}