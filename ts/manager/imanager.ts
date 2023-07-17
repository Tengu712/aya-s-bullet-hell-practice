export enum KID {
    Up = 'arrowup',
    Down = 'arrowdown',
    Left = 'arrowleft',
    Right = 'arrowright',
    Z = 'z',
    X = 'x',
    Shift = 'shift',
    Escape = 'escape',
}

export class InputManager {
    private readonly kstates: Map<KID, number>;
    private readonly gstates: Map<KID, number>;
    private readonly astates: Map<KID, number>;
    private readonly gid_kid: Map<number, KID>;
    private readonly kid_gid: Map<KID, number>;
    private gamepad: Gamepad | null;

    public constructor() {
        this.kstates = new Map();
        this.gstates = new Map();
        this.astates = new Map();
        Object.entries(KID).forEach(([_, n]) => {
            this.kstates.set(n, 0);
            this.gstates.set(n, 0);
            this.astates.set(n, 0);
        });
        this.gid_kid = new Map();
        this.kid_gid = new Map();
        this.gamepad = null;

        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.kstates.has(key as KID)) {
                this.kstates.set(key as KID, 1);
                event.preventDefault();
            }
        });
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.kstates.has(key as KID)) {
                this.kstates.set(key as KID, 0);
                event.preventDefault();
            }
        });

        window.addEventListener('gamepadconnected', (event) => {
            if (this.gamepad === null)
                this.gamepad = event.gamepad;
        });
        window.addEventListener('gamepaddisconnected', (event) => {
            if (this.gamepad !== null && this.gamepad.index === event.gamepad.index)
                this.gamepad = null;
        });
    }

    // WARN: this function must be called once before game update.
    public updateGamepad() {
        if (this.gamepad === null)
            return;

        // buttons
        for (let gid = 0; gid < this.gamepad.buttons.length; ++gid) {
            const kid = this.gid_kid.get(gid);
            if (kid === undefined)
                continue;
            if (this.gamepad.buttons[gid].pressed && this.gstates.get(kid)! === 0)
                this.gstates.set(kid, 1);
            else if (!this.gamepad.buttons[gid].pressed)
                this.gstates.set(kid, 0);
        }

        // TODO: let player set axis id
        // axes
        this.updateGamepadAxis(0, KID.Left, KID.Right);
        this.updateGamepadAxis(1, KID.Down, KID.Up);
    }

    private updateGamepadAxis(aid: number, kid_upper: KID, kid_lower: KID) {
        if (aid >= this.gamepad!.axes.length)
            return;
        const axis = this.gamepad!.axes[aid].valueOf();
        if (axis > 0.5) {
            if (this.astates.get(kid_upper)! === 0) {
                this.astates.set(kid_upper, 1);
                this.astates.set(kid_lower, 0);
            }
        }
        else if (axis < -0.5) {
            if (this.astates.get(kid_lower)! === 0) {
                this.astates.set(kid_upper, 0);
                this.astates.set(kid_lower, 1);
            }
        }
        else {
            this.astates.set(kid_upper, 0);
            this.astates.set(kid_lower, 0);
        }
    }

    // WARN: this function must be called once at the end of the frame.
    public increment() {
        for (const [k, v] of this.kstates) {
            if (v > 0)
                this.kstates.set(k, v + 1);
        }
        for (const [k, v] of this.gstates) {
            if (v > 0)
                this.gstates.set(k, v + 1);
        }
        for (const [k, v] of this.astates) {
            if (v > 0)
                this.astates.set(k, v + 1);
        }
    }

    public get(kid: KID): number {
        return Math.max(this.kstates.get(kid)!, this.gstates.get(kid)!, this.astates.get(kid)!);
    }

    public getKeyboard(kid: KID): number {
        return this.kstates.get(kid)!;
    }

    public getGID(kid: KID): number | undefined {
        return this.kid_gid.get(kid);
    }

    // WARNING: if gid is already used, the previous kid will be removed.
    public setGID(kid: KID, gid: number) {
        // remove previous
        if (this.gid_kid.has(gid)) this.removeGID(this.gid_kid.get(gid)!);
        if (this.kid_gid.has(kid)) this.removeGID(kid);
        // set new
        this.gstates.set(kid, 0);
        this.gid_kid.set(gid, kid);
        this.kid_gid.set(kid, gid);
    }

    public removeGID(kid: KID) {
        const gid = this.kid_gid.get(kid);
        if (gid === undefined)
            return;
        this.gstates.set(kid, 0);
        this.gid_kid.delete(gid);
        this.kid_gid.delete(kid);
    }

    // NOTE: for config scene.
    public getPressedGID(): number | undefined {
        if (this.gamepad === null)
            return undefined;
        for (let gid = 0; gid < this.gamepad.buttons.length; ++gid) {
            if (this.gamepad.buttons[gid].pressed)
                return gid;
        }
        return undefined;
    }
}
