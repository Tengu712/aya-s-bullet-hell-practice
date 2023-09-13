export class FpsCounter {
  private static readonly DIV_60MSPF = 60.0 / 1000.0

  private readonly fpsLabel: HTMLLabelElement
  private start: number
  private prev: number
  private cnt: number

  constructor(fpsLabel: HTMLLabelElement) {
    this.fpsLabel = fpsLabel
    this.start = 0
    this.prev = 0
    this.cnt = 0
  }

  update(timeStamp: number): number {
    this.cnt += 1

    const duration = timeStamp - this.start
    if (duration > 1000.0) {
      this.fpsLabel.innerText = (this.cnt * 1000.0 / duration).toFixed(1) + 'fps'
      this.start = timeStamp
      this.cnt = 0
    }

    const deltaTime = (timeStamp - this.prev) * FpsCounter.DIV_60MSPF

    this.prev = timeStamp
    return deltaTime
  }
}
