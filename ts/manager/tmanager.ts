/// [BUILDER PATTERN]
export class TextBuilder {
    private readonly elem: HTMLLabelElement;

    public constructor(text: string) {
        this.elem = document.createElement('label');
        this.elem.innerText = text;
        this.elem.style.fontSize = '24px';
    }

    public size(size: number): TextBuilder {
        this.elem.style.fontSize = size + 'px';
        return this;
    }

    // WARNING: left and top is in percentage.
    public lt(left: number, top: number): TextBuilder {
        this.elem.style.left = left + '%';
        this.elem.style.top = top + '%';
        return this;
    }

    // WARNING: right and bottom is in percentage.
    public rb(right: number, bottom: number): TextBuilder {
        this.elem.style.right = right + '%';
        this.elem.style.bottom = bottom + '%';
        return this;
    }

    public color(color: string): TextBuilder {
        this.elem.style.color = color;
        return this;
    }

    public build(): HTMLLabelElement {
        return this.elem;
    }
}

export class TextManager {
    private readonly map: Map<HTMLLabelElement, number>;
    private readonly wrapper: HTMLDivElement;

    public constructor() {
        this.map = new Map();
        this.wrapper = document.getElementById('wrapper') as HTMLDivElement;
    }

    public add(elem: HTMLLabelElement) {
        const size = +elem.style.fontSize.substring(0, elem.style.fontSize.length - 2);
        this.wrapper.appendChild(elem);
        this.map.set(elem, size);
    }

    public remove(elem: HTMLLabelElement) {
        elem.remove();
        this.map.delete(elem);
    }

    public resize(rate: number) {
        for (const [elem, size] of this.map) {
            elem.style.fontSize = (size * rate) + 'px';
        }
    }
}
