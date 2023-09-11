import { IAppFacade } from "@/IAppFacade"
import { TDrawQuery } from "@/graphics/TDrawQuery"
import { IRenderingAttachment } from "@/scene/IRenderingAttachment"
import { IRenderingModifier } from "@/scene/IRenderingModifier"

import { IRenderingObject } from "@/scene/IRenderingObject"

export class Plain implements IRenderingObject {
  private readonly app: IAppFacade
  private attachments: IRenderingAttachment[]
  private query: TDrawQuery

  constructor(app: IAppFacade, key: string) {
    this.app = app
    this.attachments = []
    this.query = {
      key: key,
      scl: [1, 1],
      rot: [0, 0, 0],
      trs: [0, 0, 0],
      col: [1, 1, 1, 1],
    }
  }

  modify(modifier: IRenderingModifier): IRenderingObject {
    modifier.accept(this)
    return this
  }

  attach(attachment: IRenderingAttachment): IRenderingObject {
    attachment.accept(this)
    this.attachments.push(attachment)
    return this
  }

  detach(attachment: IRenderingAttachment): IRenderingObject {
    this.attachments = this.attachments.filter((n) => n !== attachment)
    return this
  }

  getQuery(): TDrawQuery {
    return this.query
  }

  update(deltaTime: number): void {
    const next = []
    for (const attachment of this.attachments) {
      if (attachment.acceptUpdate(this, deltaTime))
        next.push(attachment)
    }
    this.attachments = next
  }

  draw(): void {
    this.app.draw(this.query)
  }
}
