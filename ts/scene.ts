import { GameApp } from "./index"

export interface Scene {
    update(app: GameApp): Scene|null;
}
