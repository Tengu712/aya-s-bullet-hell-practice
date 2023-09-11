import { TKeyID } from "@/input/TKeyID"

import { IInputManager } from "@/input/IInputManager"

export class InputManager implements IInputManager {
  private static readonly KEYS: TKeyID[] = [
    'arrowup',
    'arrowdown',
    'arrowleft',
    'arrowright',
    'z',
    'x',
    'shift',
    'escape',
  ]

  private readonly kstates: Map<TKeyID, number>
  private readonly gstates: Map<TKeyID, number>
  private readonly astates: Map<TKeyID, number>
  private readonly gid_kid: Map<number, TKeyID>
  private readonly kid_gid: Map<TKeyID, number>
  private gamepad: Gamepad | null

  constructor() {
    this.kstates = new Map()
    this.gstates = new Map()
    this.astates = new Map()
    this.gid_kid = new Map()
    this.kid_gid = new Map()
    this.gamepad = null

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      if (InputManager.KEYS.includes(key as TKeyID)) {
        if (!this.kstates.has(key as TKeyID))
          this.kstates.set(key as TKeyID, 0)
        event.preventDefault()
      }
    })
    document.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase()
      if (InputManager.KEYS.includes(key as TKeyID)) {
        this.kstates.delete(key as TKeyID)
        event.preventDefault()
      }
    })

    window.addEventListener('gamepadconnected', (event) => {
      if (this.gamepad === null)
        this.gamepad = event.gamepad
    })
    window.addEventListener('gamepaddisconnected', (event) => {
      if (this.gamepad !== null && this.gamepad.index === event.gamepad.index) {
        this.gamepad = null
        this.gstates.clear()
        this.astates.clear()
      }
    })
  }

  update(): void {
    if (this.gamepad !== null) {
      for (const [gid, kid] of this.gid_kid) {
        if (gid >= this.gamepad.buttons.length)
          continue
        if (this.gamepad.buttons[gid].pressed && !this.gstates.has(kid))
          this.gstates.set(kid, 0)
        else if (!this.gamepad.buttons[gid].pressed && this.gstates.has(kid))
          this.gstates.delete(kid)
      }
      // TODO: support axis
    }

    for (const [k, v] of this.kstates) {
      this.kstates.set(k, v + 1)
    }
    for (const [k, v] of this.gstates) {
      this.gstates.set(k, v + 1)
    }
    for (const [k, v] of this.astates) {
      this.astates.set(k, v + 1)
    }
  }

  get(id: TKeyID): number {
    return Math.max(
      this.kstates.get(id) ?? 0,
      this.gstates.get(id) ?? 0,
      this.astates.get(id) ?? 0
    )
  }

  getKeyboard(id: TKeyID): number {
    return this.kstates.get(id) ?? 0
  }

  getGamepadID(kid: TKeyID): number | undefined {
    return this.kid_gid.get(kid)
  }

  setGamepadID(kid: TKeyID, gid: number): void {
    // remove previous
    if (this.gid_kid.has(gid)) this.removeGamepadID(this.gid_kid.get(gid)!)
    if (this.kid_gid.has(kid)) this.removeGamepadID(kid)
    // set new
    this.gstates.set(kid, 0)
    this.gid_kid.set(gid, kid)
    this.kid_gid.set(kid, gid)
  }

  removeGamepadID(kid: TKeyID): void {
    const gid = this.kid_gid.get(kid)
    if (gid === undefined)
      return
    this.gstates.set(kid, 0)
    this.gid_kid.delete(gid)
    this.kid_gid.delete(kid)
  }

  getPressedGamepadID(): number | undefined {
    if (this.gamepad === null)
      return undefined
    for (let gid = 0; gid < this.gamepad.buttons.length; ++gid) {
      if (this.gamepad.buttons[gid].pressed)
        return gid
    }
    // TODO: support Axis
    return undefined
  }
}