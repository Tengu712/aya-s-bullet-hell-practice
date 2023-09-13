import { TKeyID } from "./TKeyID"

export interface IInputManager {
  update(): void
  get(id: TKeyID): number
  getKeyboard(id: TKeyID): number
  getGamepadID(kid: TKeyID): number | undefined
  setGamepadID(kid: TKeyID, gid: number): void
  removeGamepadID(kid: TKeyID): void
  getPressedGamepadID(): number | undefined
}
