import { TVec2 } from "@/util/TVec2"
import { TVec4 } from "@/util/TVec4"
import { TCamera } from "@/graphics/TCamera"
import { TDrawQuery } from "@/graphics/TDrawQuery"
import { IRenderer } from "@/graphics/IRenderer"
import { ITextManager } from "@/text/ITextManager"
import { IInputManager } from "@/input/IInputManager"

import { IAppFacade } from "@/IAppFacade"

export class AppFacade implements IAppFacade {
  private readonly width: number
  private readonly height: number
  private readonly renderer: IRenderer
  private readonly textManager: ITextManager
  private readonly inputManager: IInputManager

  constructor(
    width: number,
    height: number,
    renderer: IRenderer,
    textManager: ITextManager,
    inputManager: IInputManager
  ) {
    this.width = width
    this.height = height
    this.renderer = renderer
    this.textManager = textManager
    this.inputManager = inputManager
  }

  /* =============================================================================================================== */
  /*     graphics                                                                                                    */
  /* =============================================================================================================== */

  getwidth(): number {
    return this.width
  }
  getHeight(): number {
    return this.height
  }
  getSize(): TVec2 {
    return [this.width, this.height]
  }
  loadBitmap(url: string, uvs: [string, TVec4][]): Promise<void> {
    return this.renderer.loadBitmap(url, uvs)
  }
  setCamera(camera: TCamera): void {
    return this.renderer.setCamera(camera)
  }
  draw(query: TDrawQuery): void {
    return this.renderer.draw(query)
  }

  /* =============================================================================================================== */
  /*     input                                                                                                       */
  /* =============================================================================================================== */

  addText(text: HTMLLabelElement): void {
    return this.textManager.add(text)
  }

  deleteText(text: HTMLLabelElement): void {
    return this.textManager.delete(text)
  }

  /* =============================================================================================================== */
  /*     input                                                                                                       */
  /* =============================================================================================================== */

  getInputManager(): IInputManager {
    return this.inputManager
  }
}
