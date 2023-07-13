import { WebGL2App } from "./webgl2";
import { DrawQueryBuilder } from "./webgl2/dquery";

function loadImage(wapp: WebGL2App, url: string, key: string): Promise<void> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
            wapp.loadBitmapTexture(image, key);
            resolve();
        }
        image.src = url;
    });
}

export async function loadResources(wapp: WebGL2App) {
    // load
    await loadImage(wapp, '../data/load.png', 'load');
    wapp.setUVs([['load', [0.0, 0.0, 640.0 / 1024, 480.0 / 512.0]]]);
    wapp.clear();
    wapp.bindTexture('load');
    wapp.draw(new DrawQueryBuilder('load', [1280.0, 960.0]).build());
    wapp.flush();
    
    // load all
    const promises = [
        loadImage(wapp, '../data/title.png', 'title'),
    ];
    const DIV_1024 = 1.0 / 1024.0;
    const DIV_2048 = 1.0 / 2048.0;
    wapp.setUVs([
        ['title', [0.0, 0.0, 1280.0 * DIV_2048, 960.0 * DIV_1024]],
        ['title-practice', [1280.0 * DIV_2048, 0.0 * DIV_1024, 1792.0 * DIV_2048, 64.0 * DIV_1024]],
        ['title-start', [1280.0 * DIV_2048, 64.0 * DIV_1024, 1792.0 * DIV_2048, 128.0 * DIV_1024]],
        ['title-assemble', [1280.0 * DIV_2048, 128.0 * DIV_1024, 1792.0 * DIV_2048, 192.0 * DIV_1024]],
        ['title-result', [1280.0 * DIV_2048, 192.0 * DIV_1024, 1792.0 * DIV_2048, 256.0 * DIV_1024]],
        ['title-config', [1280.0 * DIV_2048, 256.0 * DIV_1024, 1792.0 * DIV_2048, 320.0 * DIV_1024]],
    ]);
    await Promise.all(promises);
}
