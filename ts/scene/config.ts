import { GameApp } from "..";
import { KID } from "../manager/imanager";
import { TextBuilder } from "../manager/tmanager";
import { Scene } from "../scene";
import { DrawQueryBuilder } from "../webgl2/dquery";
import { TitleScene } from "./title";

const FADE_CNT = 20;
const OPTS = ['Up', 'Down', 'Left', 'Right', 'Z', 'X', 'Shift', 'Escape', 'Framerate Adaptation', 'Debug Mode'];
const TAIL_GP = '\nEscape: 終了, 上下キー: 選択, X: キー解除, ゲームパッド: キー割付';
const TAIL_ED = '\nEscape: 終了, 上下キー: 選択, 左右キー: Enable/Disable';
const CAPTIONS = [
    '上キーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    '下キーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    '左キーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    '右キーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    'Zキーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    'Xキーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    'Shiftキーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    'Escapeキーに対応するゲームパッドのボタンを設定します。' + TAIL_GP,
    'フレームレートに合わせてゲーム内時間を自動調整します。Disableにすると60FPS基準で動作します。' + TAIL_ED,
    'デバッグモードを有効にします。純粋にゲームを楽しみたい方はDisableにしてください。' + TAIL_ED,
];

enum State {
    Fadein,
    Normal,
}

function updateGID(app: GameApp, kid: KID) {
    // unbind
    if (app.im.getKeyboard(KID.X) === 1)
        app.im.removeGID(kid);

    // bind
    const gid = app.im.getPressedGID();
    if (gid !== undefined)
        app.im.setGID(kid, gid);
}

export class ConfigScene implements Scene {
    private state: State;
    private cnt: number;
    private cursor: number;
    private lefts: HTMLLabelElement[];
    private rights: HTMLLabelElement[];
    private caption: HTMLLabelElement;

    public constructor(app: GameApp) {
        // system
        this.state = State.Fadein;
        this.cnt = 0;
        this.cursor = 0;

        // texts
        this.lefts = [];
        this.rights = [];
        for (let i = 0; i < OPTS.length; ++i) {
            const left = new TextBuilder(OPTS[i]).size(32).lt(25, 15 + 5 * i).build();
            const right = new TextBuilder('').size(32).lt(70, 15 + 5 * i).build();
            app.tm.add(left);
            app.tm.add(right);
            this.lefts.push(left);
            this.rights.push(right);
        }
        this.caption = new TextBuilder('').size(18).lt(10, 85).build();
        app.tm.add(this.caption);

        // update
        this.updateRights(app);
        this.updateTextsCol();
        this.updateCaption();
    }

    public update(app: GameApp): Scene | null {
        switch (this.state) {
            case State.Fadein:
                if (this.cnt > FADE_CNT)
                    this.state = State.Normal;
                this.updateTextsCol();
                this.cnt += app.pft;
                break;
            case State.Normal:
                if (app.im.getKeyboard(KID.Escape) === 1) {
                    for (const e of this.lefts) app.tm.remove(e);
                    for (const e of this.rights) app.tm.remove(e);
                    app.tm.remove(this.caption);
                    return new TitleScene();
                }
                if (app.im.getKeyboard(KID.Down) === 1) {
                    this.cursor += 1;
                    this.updateTextsCol();
                    this.updateCaption();
                }
                if (app.im.getKeyboard(KID.Up) === 1) {
                    this.cursor += OPTS.length - 1;
                    this.updateTextsCol();
                    this.updateCaption();
                }
                this.updateConfig(app);
                break;
        }

        // draw background
        app.wapp.bindTexture('white');
        app.wapp.draw(new DrawQueryBuilder('white', [1280.0, 960.0]).col([0.0, 0.0, 0.0, 1.0]).build());

        // TODO: draw objects

        // draw fadein
        if (this.state === State.Fadein) {
            app.wapp.bindTexture('white');
            app.wapp.draw(
                new DrawQueryBuilder('white', [1280.0, 960.0])
                    .col([0.0, 0.0, 0.0, (FADE_CNT - this.cnt) / FADE_CNT])
                    .build()
            );
        }

        // finish
        return null;
    }

    private updateTextsCol() {
        const a = 1.0 - (FADE_CNT - this.cnt) / FADE_CNT;
        const astr_unselected = 'rgba(255, 255, 255, ' + (a * 0.5).toString() + ')';
        const astr_selected = 'rgba(255, 255, 255, ' + a.toString() + ')';
        for (let i = 0; i < OPTS.length; ++i) {
            if (i === this.cursor % OPTS.length) {
                this.lefts[i].style.color = astr_selected;
                this.rights[i].style.color = astr_selected;
            } else {
                this.lefts[i].style.color = astr_unselected;
                this.rights[i].style.color = astr_unselected;
            }
        }
        this.caption.style.color = astr_selected;
    }

    private updateCaption() {
        this.caption.innerText = CAPTIONS[this.cursor % OPTS.length];
    }

    private updateRights(app: GameApp) {
        this.rights[0].innerText = (app.im.getGID(KID.Up) ?? 'None') as string;
        this.rights[1].innerText = (app.im.getGID(KID.Down) ?? 'None') as string;
        this.rights[2].innerText = (app.im.getGID(KID.Left) ?? 'None') as string;
        this.rights[3].innerText = (app.im.getGID(KID.Right) ?? 'None') as string;
        this.rights[4].innerText = (app.im.getGID(KID.Z) ?? 'None') as string;
        this.rights[5].innerText = (app.im.getGID(KID.X) ?? 'None') as string;
        this.rights[6].innerText = (app.im.getGID(KID.Shift) ?? 'None') as string;
        this.rights[7].innerText = (app.im.getGID(KID.Escape) ?? 'None') as string;
        this.rights[8].innerText = app.framerate_adaptation ? 'Enable' : 'Disable';
        this.rights[9].innerText = app.debug_mode ? 'Enable' : 'Disable';
    }

    private updateConfig(app: GameApp) {
        const l_or_r = app.im.getKeyboard(KID.Right) === 1 || app.im.getKeyboard(KID.Left) === 1;
        switch (this.cursor % OPTS.length) {
            case 0: updateGID(app, KID.Up); break;
            case 1: updateGID(app, KID.Down); break;
            case 2: updateGID(app, KID.Left); break;
            case 3: updateGID(app, KID.Right); break;
            case 4: updateGID(app, KID.Z); break;
            case 5: updateGID(app, KID.X); break;
            case 6: updateGID(app, KID.Shift); break;
            case 7: updateGID(app, KID.Escape); break;
            case 8:
                if (!l_or_r) return;
                app.framerate_adaptation = !app.framerate_adaptation;
                break;
            case 9:
                if (!l_or_r) return;
                app.debug_mode = !app.debug_mode;
                break;
        }
        this.updateRights(app);
    }
}