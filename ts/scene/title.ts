import { Scene } from "../scene";
import { GameApp } from "../index";
import { DrawQueryBuilder, DrawType } from "../webgl2/dquery";

const FADEIN_CNT = 40;
const FLASH_CNT = 40;
const FADEOUT_CNT = 60;
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

    public constructor() {
        this.state = State.Fadein;
        this.cnt = 0;
        this.cursor = 0;
    }

    public update(app: GameApp): Scene | null {
        // update based on state except fadeout
        this.update_state(app);

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

        // draw fadein
        if (this.state === State.Fadein) {
            app.wapp.bindTexture('white');
            app.wapp.draw(
                new DrawQueryBuilder('white', [1280.0, 960.0])
                    .col([1.0, 1.0, 1.0, (FADEIN_CNT - this.cnt) / FADEIN_CNT])
                    .build()
            );
        }

        // draw fadeout
        if (this.state === State.Fadeout) {
            app.wapp.bindTexture('white');
            app.wapp.draw(
                new DrawQueryBuilder('white', [1280.0, 960.0])
                    .col([0.0, 0.0, 0.0, this.cnt / FADEOUT_CNT])
                    .build()
            );
        }

        // if fadeout is finished, return next scene
        if (this.state === State.Fadeout && this.cnt > FADEOUT_CNT) {
            // TODO: 
            switch (this.cursor % OPTS.length) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    this.state = State.Fadein; // DEBUG
                    this.cnt = 0; // DEBUG
                    return null;
            }
        }

        // finish
        this.cnt += app.pft;
        return this;
    }

    private update_state(app: GameApp) {
        switch (this.state) {
            case State.Fadein:
                if (this.cnt > FADEIN_CNT)
                    this.state = State.Normal;
                break;
            case State.Normal:
                if (app.istates.get('arrowdown') === 1)
                    this.cursor += 1;
                if (app.istates.get('arrowup') === 1)
                    this.cursor += OPTS.length - 1;
                if (app.istates.get('z') === 1) {
                    this.state = State.Flash;
                    this.cnt = 0;
                }
                break;
            case State.Flash:
                if (this.cnt > FLASH_CNT) {
                    this.state = State.Fadeout;
                    this.cnt = 0;
                }
                break;
        }
    }
}
