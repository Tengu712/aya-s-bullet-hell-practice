use super::*;

use crate::scene::{load::LoadScene, Scene};

use sstar::log::*;
use std::fs::File;
use std::io::{BufRead, BufReader};

impl System {
    /// A constructor for this game.
    /// WARNING: It must be called only once at runtime.
    pub fn new() -> Self {
        // read settings.cfg into a hashmap
        let file = File::open("settings.cfg")
            .unwrap_or_else(|e| ss_error(&format!("failed to open settings.cfg : {e}")));
        let mut settings = HashMap::new();
        for l in BufReader::new(file).lines() {
            let l = l.unwrap();
            let (k, v) = l
                .split_once('=')
                .unwrap_or_else(|| ss_error(&format!("invalid line '{l}' found in settings.cfg.")));
            settings.insert(k.to_string(), v.to_string());
        }

        // configure
        let (scene_scale, sw, sh) = graphics::configure(&settings);
        let js_map = input::configure(&settings);

        // create sstar instances
        let window_app = WindowApp::new("射命丸文の弾幕稽古", sw, sh);
        let vulkan_app = VulkanApp::new(&window_app, 10);
        let glyph_rasterizer =
            GlyphRasterizer::new("./res/mplus-2p-medium.ttf").unwrap_or_else(|e| ss_error(&e));

        // finish
        Self {
            scene_scale,
            window_app,
            vulkan_app,
            glyph_rasterizer,
            text_infos: HashMap::new(),
            js_map,
            ub: None,
            tasks: Vec::new(),
        }
    }

    /// A method to run this game.
    /// It block thread until the game ends.
    pub fn run(mut self) {
        let mut scene: Box<dyn Scene> = Box::new(LoadScene::new());

        while self.window_app.do_events() {
            let (next, end) = scene.update(&mut self);
            if end {
                break;
            }
            self.vulkan_app
                .render(self.ub.as_ref(), &self.tasks)
                .unwrap();
            self.ub = None;
            self.tasks.clear();
            if let Some(next) = next {
                scene.terminate(&mut self);
                scene = next;
            }
        }

        self.vulkan_app.terminate();
        self.window_app.terminate();
    }
}
