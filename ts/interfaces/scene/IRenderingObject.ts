import { TDrawQuery } from "@/graphics/TDrawQuery"

import { IRenderingModifier } from "./IRenderingModifier"
import { IRenderingAttachment } from "./IRenderingAttachment"

/// [Builder Pattern]
export interface IRenderingObject {
  modify(modifier: IRenderingModifier): IRenderingObject
  attach(attachment: IRenderingAttachment): IRenderingObject
  detach(attachment: IRenderingAttachment): IRenderingObject
  getQuery(): TDrawQuery
  update(deltaTime: number): void
  draw(): void
}
