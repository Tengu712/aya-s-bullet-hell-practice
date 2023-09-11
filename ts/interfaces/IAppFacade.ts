import { TVec2 } from "@/util/TVec2"
import { TVec4 } from "@/util/TVec4"
import { TCamera } from "@/graphics/TCamera"
import { TDrawQuery } from "@/graphics/TDrawQuery"
import { IInputManager } from "@/input/IInputManager"

/// [Facade Pattern]
/// A Facade class specifically for Scene classes.
/// Thus, nothing other than the Scene class should make use of this class.
export interface IAppFacade {
  // graphics
  getwidth(): number
  getHeight(): number
  getSize(): TVec2
  loadBitmap(url: string, uvs: [string, TVec4][]): Promise<void>
  setCamera(camera: TCamera): void
  draw(query: TDrawQuery): void

  // input
  getInputManager(): IInputManager
}
