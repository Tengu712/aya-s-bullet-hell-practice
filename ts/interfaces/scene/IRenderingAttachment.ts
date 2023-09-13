import { IRenderingObject } from "./IRenderingObject"

/// [Visitor Pattern]
export interface IRenderingAttachment {
  init(): void
  accept(obj: IRenderingObject): void
  /// If it should be disposed of, return false.
  acceptUpdate(obj: IRenderingObject, deltaTime: number): boolean
}
