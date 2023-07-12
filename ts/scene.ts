import { WebGL2App } from "./webgl2"

export interface Scene {
    update(wapp: WebGL2App, pft: number): Scene|null;
}
