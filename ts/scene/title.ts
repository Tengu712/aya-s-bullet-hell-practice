import { Scene } from "../scene";
import { GameApp } from "../index";
import { DrawQueryBuilder, DrawType } from "../webgl2/dquery";

const OPTS = ['title-practice', 'title-start', 'title-assemble', 'title-result', 'title-config'];

enum State {
    Fadein,
    Normal,
    Flash,
    Fadeout,
}

export class TitleScene implements Scene {
    private state: State;
    private cnt: number;
    private cursor: number;

    constructor() {
        this.state = State.Fadein;
        this.cnt = 0;
        this.cursor = 0;
    }

    update(app: GameApp): Scene | null {
        if (app.istates.get('arrowdown') === 1)
            this.cursor += 1;
        if (app.istates.get('arrowup') === 1)
            this.cursor += OPTS.length - 1;

        app.wapp.bindTexture('title');
        app.wapp.draw(new DrawQueryBuilder('title', [1280.0, 960.0]).build());
        for (let i = 0; i < OPTS.length; ++i) {
            const uv_key = OPTS[i];
            const x = 30.0 + 30.0 * i;
            const y = 520.0 + 70.0 * i;
            const k = this.state === State.Flash ? 6.0 : 40.0;
            const c = 0.6 * Math.abs(Math.sin(this.cnt * Math.PI / k)) + 0.4;
            const col: [number, number, number, number] =
                this.cursor % OPTS.length === i
                    ? [c, c, c, 1.0]
                    : [0.6, 0.6, 0.6, 0.6];
            app.wapp.draw(
                new DrawQueryBuilder(uv_key, [512.0, 64.0])
                    .trs([x, y, 0.0])
                    .col(col)
                    .type(DrawType.TopLeftUI)
                    .build()
            );
        }
        this.cnt += app.pft;
        return null;
    }
}
