import { IScene } from "@/scene/IScene"
import { IRenderer } from "@/graphics/IRenderer"
import { ITextManager } from "@/text/ITextManager"
import { IInputManager } from "@/input/IInputManager"

import { WebGL2 } from "./graphics/WebGL2"
import { FragmentShader } from "./graphics/shader/FragmentShader"
import { VertexShader } from "./graphics/shader/VertexShader"
import { TextManager } from "./text/TextManager"
import { InputManager } from "./input/InputManager"
import { AppFacade } from "./AppFacade"
import { LoadScene } from "./scene/LoadScene"
import { BottomRightText } from "./util/BottomRightText"

/// [Instance Creation Allowed Class]
export class Program {
  private static readonly WIDTH: number = 1280
  private static readonly HEIGHT: number = 960

  private readonly renderer: IRenderer
  private readonly textManager: ITextManager
  private readonly inputManager: IInputManager
  private readonly fpsLabel: HTMLLabelElement
  private scene: IScene

  constructor() {
    // to prevent this instance from being garbage collected.
    this.run = this.run.bind(this)

    // create an app facade
    this.renderer = new WebGL2(Program.WIDTH, Program.HEIGHT, new VertexShader(), new FragmentShader())
    this.textManager = new TextManager()
    this.inputManager = new InputManager()
    const app = new AppFacade(
      Program.WIDTH,
      Program.HEIGHT,
      this.renderer,
      this.textManager,
      this.inputManager
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
      this.textManager.resize(h / Program.HEIGHT)
    }
    new ResizeObserver(() => resizeCallback()).observe(document.body)

    // add fps label
    this.fpsLabel = new BottomRightText('00.0fps', 30, 1, 0).build()
    this.textManager.add(this.fpsLabel)
  }

  run() {
    // TODO: calculate deltaTime

    this.inputManager.update()
    this.renderer.clear()
    this.scene = this.scene.update(1)
    this.renderer.flush()

    requestAnimationFrame(this.run)
  }
}
