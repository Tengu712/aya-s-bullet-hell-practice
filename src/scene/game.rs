use super::*;

use crate::resource::*;
use crate::system::{graphics::*, input::*};

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
        system.set_image_texture(TextureID::Game);

        // frame
        let pc_frame = PushConstant {
            scl: [2048.0, 2048.0, 1.0, 0.0],
            ..Default::default()
        };
        system.draw(pc_frame, Position::UpperLeftUI);

        // DEBUG:
        system.set_image_texture(TextureID::SelectText);
        system.draw_text("Assemble", 640.0, 480.0, Position::CenterUI);
        system.draw_text("Settings", 0.0, 0.0, Position::UpperLeftUI);

        // finish
        (None, false)
    }
}
