use super::*;

use crate::obj::{player::Player, bullet::Bullet};
use crate::resource::*;

use sstar::{app::graphics::Position, vulkan::PushConstant};

pub struct GameScene {
    player: Player,
    pbuls: Vec<Bullet>
}

impl GameScene {
    pub fn new() -> Self {
        Self {
            player: Player::new(),
            pbuls: Vec::new(),
        }
    }
}

impl Scene for GameScene {
    fn update(&mut self, app: &mut SStarApp, ginf: &mut GameInfo) -> Option<Box<dyn Scene>> {
        // update entities
        // player
        self.player.update(app, ginf, &mut self.pbuls);
        // player bullets
        let mut new_pbuls = Vec::with_capacity(self.pbuls.len());
        for n in self.pbuls.iter_mut() {
            if n.update(ginf, &mut new_pbuls) {
                new_pbuls.push(n.clone());
            }
        }
        self.pbuls = new_pbuls;

        // bind a bitmap texture for game
        app.bind_texture(TextureID::Game as usize);

        // entities
        app.bind_texture(TextureID::Default as usize); // TODO:
        self.player.draw(app, ginf);
        for n in self.pbuls.iter() {
            n.draw(app, ginf);
        }

        // frame
        app.bind_texture(TextureID::Game as usize); // TODO:
        app.draw(
            PushConstant {
                scl: [2048.0, 2048.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::UpperLeftUI,
        );

        // finish
        None
    }
}
