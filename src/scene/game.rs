use super::*;

use crate::resource::*;
use crate::system::graphics::*;

use sstar::{vulkan::PushConstant, window::Keycode};

pub struct GameScene;

impl GameScene {
    pub fn new() -> Self {
        Self
    }
}

impl Scene for GameScene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool) {
        // move
        let left = system.get_input(Keycode::Left);
        if left > 0 {
            sstar::log::ss_debug(&format!("left: {left}"));
        }

        // bind a bitmap texture for game
        system.bind_texture(TextureID::Game as usize);

        // frame
        system.draw(
            PushConstant {
                scl: [2048.0, 2048.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::UpperLeftUI,
        );

        // DEBUG:
        let id = TextureID::SelectText as usize;
        system.bind_texture(id);
        system.draw_text(
            PushConstant {
                trs: [640.0, 480.0, 0.0, 0.0],
                ..Default::default()
            },
            Position::CenterUI,
            id,
            "Assemble",
        );
        system.draw_text(
            PushConstant::default(),
            Position::UpperLeftUI,
            id,
            "Settings",
        );

        // finish
        (None, true)
    }
}
