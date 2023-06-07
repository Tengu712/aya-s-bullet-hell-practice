use super::*;

use crate::scene::game::*;
use crate::scene::*;

impl System {
    pub(in super::super) fn new() -> Self {
        // TODO: create it from a configuration file.
        let scene_scale = 1.0;
        let scene_width = (BASE_SCENE_WIDTH_F32 * scene_scale) as u32;
        let scene_height = (BASE_SCENE_HEIGHT_F32 * scene_scale) as u32;

        let window_app = WindowApp::new("Aya's Bullet-Hell Practice", scene_width, scene_height);
        let vulkan_app = VulkanApp::new(&window_app, 10);

        Self {
            scene_scale,
            window_app,
            vulkan_app,
            ub: None,
            tasks: Vec::new(),
        }
    }

    pub(in super::super) fn run(mut self) {
        // TODO: start with title scene.
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
