import { TVec3 } from "@/util/TVec3"
import { IAppFacade } from "@/IAppFacade"
import { IRenderingObject } from "@/scene/IRenderingObject"

import { IRenderingModifier } from "@/scene/IRenderingModifier"

export type TPositionType = 'Center' | 'CenterUI' | 'TopLeftUI'

/// WARNING: this attachment must be attached after the Size attachment has been attached.
export class Position implements IRenderingModifier {
  private readonly app: IAppFacade
  private readonly type: TPositionType
  private readonly trs: TVec3

  constructor(app: IAppFacade, type: TPositionType, trs: TVec3) {
    this.app = app
    this.type = type
    this.trs = trs
  }

  accept(obj: IRenderingObject): void {
    switch (this.type) {
      case 'Center':
        obj.getQuery().trs = this.trs
        break
      case 'CenterUI':
        obj.getQuery().trs = this.trs
        obj.getQuery().trs[1] *= -1.0
        obj.getQuery().trs[0] -= this.app.getwidth() * 0.5
        obj.getQuery().trs[1] += this.app.getHeight() * 0.5
        break
      case 'TopLeftUI':
        obj.getQuery().trs = this.trs
        obj.getQuery().trs[1] *= -1.0
        obj.getQuery().trs[0] -= this.app.getwidth() * 0.5 - obj.getQuery().scl[0] * 0.5
        obj.getQuery().trs[1] += this.app.getHeight() * 0.5 - obj.getQuery().scl[1] * 0.5
        break
    }
  }
}
