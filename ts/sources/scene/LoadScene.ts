import { TVec4 } from "@/util/TVec4"
import { IAppFacade } from "@/IAppFacade"
import { IRenderingObject } from "@/scene/IRenderingObject"

import { ViewMatrix } from "~/util/ViewMatrix"
import { OrthoMatrix } from "~/util/OrthoMatrix"

import { Plain } from "./object/Plain"
import { Size } from "./modifier/Size"
import { TitleScene } from "./TitleScene"

import { IScene } from "@/scene/IScene"

const DIV_1024 = 1.0 / 1024.0;
const DIV_2048 = 1.0 / 2048.0;

/// [Instance Creation Allowed Class]
export class LoadScene implements IScene {
  private static readonly LOAD_INFOS: [string, TVec4][] = [
    ['load', [0.0, 0.0, 640.0 / 1024, 480.0 / 512.0]]
  ]
  private static readonly WHITE_INFOS: [string, TVec4][] = [
    ['white', [0, 0, 1, 1]]
  ]
  private static readonly TITLE_INFOS: [string, TVec4][] = [
    ['title', [0.0, 0.0, 1280.0 * DIV_2048, 960.0 * DIV_1024]],
    ['title-practice', [1280.0 * DIV_2048, 0.0 * DIV_1024, 1792.0 * DIV_2048, 64.0 * DIV_1024]],
    ['title-start', [1280.0 * DIV_2048, 64.0 * DIV_1024, 1792.0 * DIV_2048, 128.0 * DIV_1024]],
    ['title-assemble', [1280.0 * DIV_2048, 128.0 * DIV_1024, 1792.0 * DIV_2048, 192.0 * DIV_1024]],
    ['title-result', [1280.0 * DIV_2048, 192.0 * DIV_1024, 1792.0 * DIV_2048, 256.0 * DIV_1024]],
    ['title-config', [1280.0 * DIV_2048, 256.0 * DIV_1024, 1792.0 * DIV_2048, 320.0 * DIV_1024]],
  ]

  private readonly app: IAppFacade
  private readonly bg: IRenderingObject
  private isLoaded: boolean
  private isLoadedLoad: boolean

  constructor(app: IAppFacade) {
    this.app = app
    this.isLoaded = false
    this.isLoadedLoad = false
    this.bg = new Plain(app, 'load').modify(new Size(app.getSize()))
    this.app
      .loadBitmap('https://abpdat.skdassoc.work/load.png', LoadScene.LOAD_INFOS)
      .then(this.onLoadLoad)
  }

  private onLoadLoad = () => {
    this.isLoadedLoad = true
    Promise.all([
      this.app.loadBitmap('https://abpdat.skdassoc.work/white.png', LoadScene.WHITE_INFOS),
      this.app.loadBitmap('https://abpdat.skdassoc.work/title.png', LoadScene.TITLE_INFOS),
    ])
      .then(this.onLoadBitmaps)
  }

  private onLoadBitmaps = () => {
    this.isLoaded = true
  }

  update(deltaTime: number): IScene {
    if (this.isLoadedLoad) {
      this.app.setCamera({
        view: new ViewMatrix([0, 0, 0], [0, 0, 0]).build(),
        proj: new OrthoMatrix(this.app.getwidth(), this.app.getHeight(), 1000).build()
      })
      this.bg.draw()
    }
    if (this.isLoaded)
      return new TitleScene(this.app)
    else
      return this
  }
}
