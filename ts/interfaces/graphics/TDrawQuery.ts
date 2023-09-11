import { TVec2 } from "@/util/TVec2"
import { TVec3 } from "@/util/TVec3"
import { TVec4 } from "@/util/TVec4"

export type TDrawQuery = {
  key: string,
  scl: TVec2,
  rot: TVec3,
  trs: TVec3,
  col: TVec4,
}
