import { TVec4 } from "@/util/TVec4"
import { IRenderingObject } from "@/scene/IRenderingObject"

import { IRenderingModifier } from "@/scene/IRenderingModifier"

export class Color implements IRenderingModifier {
  private readonly col: TVec4
  constructor(col: TVec4) {
    this.col = col
  }
  accept(obj: IRenderingObject): void {
    obj.getQuery().col = this.col
  }
}
