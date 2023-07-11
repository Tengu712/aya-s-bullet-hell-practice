import { WebGL2App } from "./webgl2";

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
    await loadImage(wapp, './data/load.png', 'load');
    wapp.bindTexture('load');
    // TODO: draw load scene
    // TODO: load all resources
}
