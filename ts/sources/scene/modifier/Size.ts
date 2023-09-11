import { TVec2 } from "@/util/TVec2"
import { IRenderingObject } from "@/scene/IRenderingObject"

import { IRenderingModifier } from "@/scene/IRenderingModifier"

export class Size implements IRenderingModifier {
  private readonly scl: TVec2
  constructor(scl: TVec2) {
    this.scl = scl
  }
  accept(obj: IRenderingObject): void {
    obj.getQuery().scl = this.scl
  }
}
