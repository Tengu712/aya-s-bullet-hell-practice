use super::*;

use crate::resource::{image::*, text::*};
use crate::system::input::*;

use sstar::vulkan::PushConstant;

pub struct GameScene;

impl GameScene {
    pub fn new() -> Self {
        Self
    }
}

impl Scene for GameScene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool) {
        // move
        let left = system.get_input(AbpKeycode::Left);
        if left > 0 {
            sstar::log::ss_debug(&format!("left: {left}"));
        }

        // set image texture for game
        system.set_image_texture(IMG_TEX_GAME.id);

        // frame
        let pc_frame = PushConstant {
            scl: [2048.0, 2048.0, 1.0, 0.0],
            ..Default::default()
        };
        system.draw_ui(pc_frame);

        // DEBUG:
        system.set_image_texture(TXT_TEXTURE_SELECT.id);
        system.draw_text(TXT_SELECT_SETTING.tid, 640.0, 480.0);
        system.draw_text(TXT_SELECT_ASSEMBLE.tid, 0.0, 0.0);

        // finish
        (None, false)
    }

    fn terminate(&mut self, _: &mut System) {}
}
