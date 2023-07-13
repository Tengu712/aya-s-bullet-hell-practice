export class TextManager {
    private readonly map: Map<string, [HTMLLabelElement, number]>;
    private readonly wrapper: HTMLDivElement;

    public constructor() {
        this.map = new Map();
        this.wrapper = document.getElementById('wrapper') as HTMLDivElement;
    }

    public add(key: string, text: string, size: number, x: number, y: number): HTMLLabelElement {
        const elem = document.createElement('label');
        elem.innerText = text;
        elem.style.fontSize = size + 'px';
        elem.style.left = x + 'px';
        elem.style.top = y + 'px';
        this.wrapper.appendChild(elem);
        this.map.set(key, [elem, size]);
        return elem;
    }

    public remove(key: string) {
        const elem = this.map.get(key);
        if (elem !== undefined) {
            elem[0].remove();
            this.map.delete(key);
        }
    }

    public resize(rate: number) {
        for (const [elem, size] of this.map.values()) {
            elem.style.fontSize = (size * rate) + 'px';
        }
    }
}
