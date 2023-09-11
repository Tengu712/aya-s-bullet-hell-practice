import { IScene } from "@/scene/IScene"
import { IRenderer } from "@/graphics/IRenderer"

import { WebGL2 } from "./graphics/WebGL2"
import { FragmentShader } from "./graphics/shader/FragmentShader"
import { VertexShader } from "./graphics/shader/VertexShader"
import { AppFacade } from "./AppFacade"
import { LoadScene } from "./scene/LoadScene"

/// [Instance Creation Allowed Class]
export class Program {
  private static readonly WIDTH: number = 1280
  private static readonly HEIGHT: number = 960

  private readonly renderer: IRenderer
  private scene: IScene

  constructor() {
    // to prevent this instance from being garbage collected.
    this.run = this.run.bind(this)

    // create an app facade
    this.renderer = new WebGL2(Program.WIDTH, Program.HEIGHT, new VertexShader(), new FragmentShader())
    const app = new AppFacade(
      Program.WIDTH,
      Program.HEIGHT,
      this.renderer
    )
    this.scene = new LoadScene(app)

    // to fit the Canvas inside the screen while maintaining a 4:3 aspect ratio.
    const wrapper = document.getElementById('wrapper') as HTMLDivElement
    const resizeCallback = () => {
      let w = window.innerWidth
      let h = window.innerHeight
      if (w * 3 / 4 < h) {
        h = w * 3 / 4
        wrapper.style.width = w + 'px'
        wrapper.style.height = h + 'px'
      } else {
        w = h * 4 / 3
        wrapper.style.width = w + 'px'
        wrapper.style.height = h + 'px'
      }
    }
    new ResizeObserver(() => resizeCallback()).observe(document.body)
  }

  run() {
    // TODO: calculate deltaTime

    this.renderer.clear()
    this.scene = this.scene.update(1)
    this.renderer.flush()

    requestAnimationFrame(this.run)
  }
}
