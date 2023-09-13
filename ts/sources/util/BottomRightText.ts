export class BottomRightText {
  private readonly elem: HTMLLabelElement
  /// WARNING: right and bottom is in percentage.
  constructor(text: string, size: number, right: number, bottom: number) {
    this.elem = document.createElement('label')
    this.elem.innerText = text
    this.elem.style.fontSize = size + 'px'
    this.elem.style.right = right + '%'
    this.elem.style.bottom = bottom + '%'
  }
  build(): HTMLLabelElement {
    return this.elem
  }
}
