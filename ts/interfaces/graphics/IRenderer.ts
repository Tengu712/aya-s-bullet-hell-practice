import { TVec4 } from "@/util/TVec4"

import { TCamera } from "./TCamera"
import { TDrawQuery } from "./TDrawQuery"

export interface IRenderer {
  clear(): void
  flush(): void
  draw(query: TDrawQuery): void
  setCamera(camera: TCamera): void
  loadBitmap(url: string, uvs: [string, TVec4][]): Promise<void>
}
