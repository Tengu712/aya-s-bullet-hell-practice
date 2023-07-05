use super::*;

use crate::obj::{bullet::Bullet, enemy::Enemy, player::Player};
use crate::resource::*;

use sstar::{app::graphics::Position, vulkan::PushConstant};

pub struct GameScene {
    player: Player,
    enemies: Vec<Enemy>,
    pbuls: Vec<Bullet>,
    ebuls: Vec<Bullet>,
}

impl GameScene {
    pub fn new() -> Self {
        Self {
            player: Player::new(),
            enemies: Vec::new(),
            pbuls: Vec::new(),
            ebuls: Vec::new(),
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
        // enemies
        let mut new_ebuls = Vec::with_capacity(self.ebuls.len());
        let mut new_enemies = Vec::with_capacity(self.enemies.len());
        for n in self.enemies.iter_mut() {
            if n.update(app, ginf, &mut new_ebuls) {
                new_enemies.push(n.clone());
            }
        }
        self.enemies = new_enemies;
        // enemy bullets
        for n in self.ebuls.iter_mut() {
            if n.update(ginf, &mut new_ebuls) {
                new_ebuls.push(n.clone());
            }
        }
        self.ebuls = new_ebuls;

        // bind a bitmap texture for game
        app.bind_texture(TextureID::Game as usize);

        // entities
        app.bind_texture(TextureID::Default as usize); // TODO:
        self.player.draw(app, ginf);
        self.enemies.iter().for_each(|n| n.draw(app, ginf));
        self.pbuls.iter().for_each(|n| n.draw(app, ginf));
        self.ebuls.iter().for_each(|n| n.draw(app, ginf));

        // frame
        app.bind_texture(TextureID::Game as usize); // TODO:
        app.draw(
            PushConstant {
                scl: [2048.0, 2048.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::TopLeftUI,
        );

        // info
        if ginf.should_show_info {
            app.bind_texture(TextureID::SystemChars as usize);
            app.draw_chars(
                PushConstant {
                    trs: [10.0, 10.0, 0.0, 0.0],
                    ..Default::default()
                },
                Position::TopLeftUI,
                TextureID::SystemChars as usize,
                &format!("clock coef: {:01.2}", ginf.clock_coef),
            );
            app.draw_chars(
                PushConstant {
                    trs: [10.0, 40.0, 0.0, 0.0],
                    ..Default::default()
                },
                Position::TopLeftUI,
                TextureID::SystemChars as usize,
                &format!("ebuls cnt: {}", self.ebuls.len()),
            );
        }

        // finish
        None
    }
}
