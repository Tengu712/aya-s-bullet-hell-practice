use super::*;

use crate::resource::*;
use crate::system::input::*;

use sstar::vulkan::PushConstant;

pub struct GameScene;

impl GameScene {
    pub fn new(system: &mut System) -> Self {
        system.load_image_texture(&IMG_TEX_GAME);
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

        // finish
        (None, false)
    }
}
