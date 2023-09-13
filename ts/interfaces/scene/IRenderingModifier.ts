import { IRenderingObject } from "./IRenderingObject"

/// [Visitor Pattern]
export interface IRenderingModifier {
  accept(obj: IRenderingObject): void
}
