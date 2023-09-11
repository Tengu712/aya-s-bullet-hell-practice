import { TVec4 } from "@/util/TVec4"
import { IAppFacade } from "@/IAppFacade"
import { IRenderingObject } from "@/scene/IRenderingObject"
import { IRenderingAttachment } from "@/scene/IRenderingAttachment"

import { ViewMatrix } from "~/util/ViewMatrix"
import { OrthoMatrix } from "~/util/OrthoMatrix"

import { Plain } from "./object/Plain"
import { Color } from "./modifier/Color"
import { Position } from "./modifier/Position"
import { Size } from "./modifier/Size"
import { Fade } from "./attachment/Fade"
import { DynamicColor } from "./attachment/DynamicColor"

import { IScene } from "@/scene/IScene"

/// [Instance Creation Allowed Class]
export class TitleScene implements IScene {
  private static readonly OPTION_UNSELECTED_COLOR: TVec4 = [0.6, 0.6, 0.6, 0.6]
  private static readonly OPTION_DEFAULT_BLINK_INTERVAL: number = 40

  private readonly app: IAppFacade
  private readonly bg: IRenderingObject
  private readonly fadein: IRenderingObject
  private readonly options: IRenderingObject[]
  private readonly attBlink: IRenderingAttachment
  private cursor: number
  private cnt: number

  constructor(app: IAppFacade) {
    this.app = app

    // bg
    this.bg =
      new Plain(this.app, 'title')
        .modify(new Size(this.app.getSize()))

    // fadein
    this.fadein =
      new Plain(this.app, 'white')
        .modify(new Size(this.app.getSize()))
        .attach(new Fade(1, 0, 60))

    // options
    // TODO: set the value based on the scene size.
    this.options = []
    const optionSize = new Size([512.0, 64.0])
    const optionColor = new Color(TitleScene.OPTION_UNSELECTED_COLOR)
    const optionKeys = [
      'title-practice',
      'title-start',
      'title-assemble',
      'title-result',
      'title-config',
    ]
    for (let i = 0; i < optionKeys.length; ++i) {
      this.options.push(
        new Plain(this.app, optionKeys[i])
          .modify(optionSize)
          .modify(optionColor)
          .modify(new Position(this.app, 'TopLeftUI', [30.0 + 30.0 * i, 520.0 + 70.0 * i, 0]))
      )
    }

    // blink
    this.attBlink = new DynamicColor((cnt: number) => {
      const c = 0.6 * Math.abs(Math.sin(cnt * Math.PI / TitleScene.OPTION_DEFAULT_BLINK_INTERVAL)) + 0.4
      return [c, c, c, 1]
    })
    this.options[0].attach(this.attBlink)

    // vars
    this.cursor = 0
    this.cnt = 0
  }

  update(deltaTime: number): IScene {
    if (this.cnt % 120 === 0)
      this.moveCursor(1)

    this.fadein.update(deltaTime)
    for (const option of this.options) {
      option.update(deltaTime)
    }

    this.app.setCamera({
      view: new ViewMatrix([0, 0, 0], [0, 0, 0]).build(),
      proj: new OrthoMatrix(this.app.getwidth(), this.app.getHeight(), 1000).build()
    })
    this.bg.draw()
    for (const option of this.options) {
      option.draw()
    }
    this.fadein.draw()

    this.cnt += deltaTime
    return this
  }

  private moveCursor(add: number) {
    this.options[this.cursor].detach(this.attBlink)
    this.options[this.cursor].modify(new Color(TitleScene.OPTION_UNSELECTED_COLOR))
    this.cursor = (this.cursor + add) % this.options.length
    this.attBlink.init()
    this.options[this.cursor].attach(this.attBlink)
  }
}
