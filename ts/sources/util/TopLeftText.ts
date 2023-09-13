export class BottomRightText {
  private readonly elem: HTMLLabelElement
  /// WARNING: left and top is in percentage.
  constructor(text: string, size: number, left: number, top: number) {
    this.elem = document.createElement('label')
    this.elem.innerText = text
    this.elem.style.fontSize = size + 'px'
    this.elem.style.left = left + '%'
    this.elem.style.top = top + '%'
  }
  build(): HTMLLabelElement {
    return this.elem
  }
}
