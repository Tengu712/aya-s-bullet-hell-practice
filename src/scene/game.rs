use super::*;

use crate::resource::*;

use sstar::{app::graphics::Position, vulkan::PushConstant, window::Keycode};

pub struct GameScene;

impl GameScene {
    pub fn new() -> Self {
        Self
    }
}

impl Scene for GameScene {
    fn update(&mut self, app: &mut SStarApp, _: &mut GameInfo) -> Option<Box<dyn Scene>> {
        // move
        let left = app.get_input(Keycode::Left);
        if left > 0 {
            sstar::log::ss_debug(&format!("left: {left}"));
        }

        // bind a bitmap texture for game
        app.bind_texture(TextureID::Game as usize);

        // frame
        app.draw(
            PushConstant {
                scl: [2048.0, 2048.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::UpperLeftUI,
        );

        // DEBUG:
        let id = TextureID::SelectText as usize;
        app.bind_texture(id);
        app.draw_text(
            PushConstant {
                trs: [640.0, 480.0, 0.0, 0.0],
                ..Default::default()
            },
            Position::CenterUI,
            id,
            "Assemble",
        );
        app.draw_text(
            PushConstant::default(),
            Position::UpperLeftUI,
            id,
            "Settings",
        );

        // finish
        None
    }
}
