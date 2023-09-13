import { IRenderingObject } from "@/scene/IRenderingObject"

import { IRenderingAttachment } from "@/scene/IRenderingAttachment"

export class Fade implements IRenderingAttachment {
  private readonly start: number
  private readonly end: number
  private readonly interval: number
  private cnt: number

  constructor(start: number, end: number, interval: number) {
    this.start = start
    this.end = end
    this.interval = interval
    this.cnt = 0
  }

  init(): void {
    this.cnt = 0
  }

  accept(obj: IRenderingObject): void {
    obj.getQuery().col[3] = this.start + this.cnt / this.interval * (this.end - this.start)
  }

  acceptUpdate(obj: IRenderingObject, deltaTime: number): boolean {
    if (this.cnt >= this.interval)
      return false
    this.cnt += deltaTime
    obj.getQuery().col[3] = this.start + this.cnt / this.interval * (this.end - this.start)
    return true
  }
}
