use super::*;

use crate::scene::game::*;
use crate::scene::*;

impl System {
    /// A constructor for this game.
    /// WARNING: It must be called only once at runtime.
    pub fn new() -> Self {
        // TODO: create it from a configuration file.
        let scene_scale = 1.0;
        let scene_width = (BASE_SCENE_WIDTH_F32 * scene_scale) as u32;
        let scene_height = (BASE_SCENE_HEIGHT_F32 * scene_scale) as u32;
        let mut js_map = HashMap::new();
        js_map.insert(Keycode::Left, Keycode::JsButtonLeft);
        js_map.insert(Keycode::Right, Keycode::JsButtonRight);
        js_map.insert(Keycode::Up, Keycode::JsButtonUp);
        js_map.insert(Keycode::Down, Keycode::JsButtonDown);

        let window_app = WindowApp::new("Aya's Bullet-Hell Practice", scene_width, scene_height);
        let vulkan_app = VulkanApp::new(&window_app, 10);

        Self {
            scene_scale,
            window_app,
            vulkan_app,
            js_map,
            ub: None,
            tasks: Vec::new(),
        }
    }

    /// A method to run this game.
    /// It block thread until the game ends.
    pub fn run(mut self) {
        // TODO: start with load scene.
        let mut scene: Box<dyn Scene> = Box::new(GameScene::new(&mut self));

        while self.window_app.do_events() {
            let (next, end) = scene.update(&mut self);
            if let Some(next) = next {
                scene = next;
            }
            if end {
                break;
            }
            self.vulkan_app
                .render(self.ub.as_ref(), &self.tasks)
                .unwrap();
            self.ub = None;
            self.tasks.clear();
        }

        self.vulkan_app.terminate();
        self.window_app.terminate();
    }
}
