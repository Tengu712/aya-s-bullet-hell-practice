import { ITextManager } from "@/text/ITextManager"

export class TextManager implements ITextManager {
  private readonly wrapper: HTMLDivElement
  private readonly map: Map<HTMLLabelElement, number>

  constructor() {
    this.wrapper = document.getElementById('wrapper') as HTMLDivElement
    this.map = new Map()
  }

  add(elem: HTMLLabelElement) {
    const size = +elem.style.fontSize.substring(0, elem.style.fontSize.length - 2)
    this.wrapper.appendChild(elem)
    this.map.set(elem, size)
  }

  delete(elem: HTMLLabelElement) {
    this.map.delete(elem)
    elem.remove()
  }

  resize(rate: number) {
    for (const [elem, size] of this.map) {
      elem.style.fontSize = (size * rate) + 'px'
    }
  }
}
