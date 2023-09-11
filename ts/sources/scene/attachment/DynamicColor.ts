import { TVec4 } from "@/util/TVec4"
import { IRenderingObject } from "@/scene/IRenderingObject"

import { IRenderingAttachment } from "@/scene/IRenderingAttachment"

export class DynamicColor implements IRenderingAttachment {
  private readonly fun: (cnt: number) => TVec4
  private cnt: number
  constructor(fun: (cnt: number) => TVec4) {
    this.fun = fun
    this.cnt = 0
  }
  init(): void {
    this.cnt = 0
  }
  accept(obj: IRenderingObject): void {
    obj.getQuery().col = this.fun(this.cnt)
  }
  acceptUpdate(obj: IRenderingObject, deltaTime: number): boolean {
    obj.getQuery().col = this.fun(this.cnt)
    this.cnt += deltaTime
    return true
  }
}
