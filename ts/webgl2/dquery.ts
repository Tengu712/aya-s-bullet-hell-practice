import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../webgl2";

export enum DrawType {
    Center,
    CenterUI,
    TopLeftUI,
}

export type DrawQuery = {
    uv_key: string,
    scl: [number, number],
    rot: [number, number, number],
    trs: [number, number, number],
    col: [number, number, number, number],
};

// REVIEW: isn't it bad performance?
export class DrawQueryBuilder {
    private q: DrawQuery;
    private t: DrawType;

    public constructor(uv_key: string, scl: [number, number]) {
        this.q = {
            uv_key: uv_key,
            scl: scl,
            rot: [0.0, 0.0, 0.0],
            trs: [0.0, 0.0, 0.0],
            col: [1.0, 1.0, 1.0, 1.0],
        };
        this.t = DrawType.Center;
    }
    public rot(rot: [number, number, number]): DrawQueryBuilder {
        this.q.rot = rot;
        return this;
    }
    public trs(trs: [number, number, number]): DrawQueryBuilder {
        this.q.trs = trs;
        return this;
    }
    public col(col: [number, number, number, number]): DrawQueryBuilder {
        this.q.col = col;
        return this;
    }
    public type(type: DrawType): DrawQueryBuilder {
        this.t = type;
        return this;
    }
    public build(): DrawQuery {
        switch (this.t) {
            case DrawType.Center: break;
            case DrawType.CenterUI:
                this.q.trs[1] *= -1.0;
                this.q.trs[0] -= CANVAS_WIDTH * 0.5;
                this.q.trs[1] += CANVAS_HEIGHT * 0.5;
                break;
            case DrawType.TopLeftUI:
                this.q.trs[1] *= -1.0;
                this.q.trs[0] -= CANVAS_WIDTH * 0.5 - this.q.scl[0] * 0.5;
                this.q.trs[1] += CANVAS_HEIGHT * 0.5 - this.q.scl[1] * 0.5;
                break;
        }
        return this.q;
    }
}
