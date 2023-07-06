use super::*;

use crate::obj::bullet::btype;
use crate::obj::{bullet::Bullet, enemy::Enemy, player::Player};
use crate::resource::*;

use sstar::{app::graphics::Position, vulkan::PushConstant};

pub struct GameScene {
    cnt: f32,
    player: Player,
    enemies: Vec<Enemy>,
    pbuls: Vec<Bullet>,
    ebuls: Vec<Bullet>,
    graze_cnt: usize,
}

impl GameScene {
    pub fn new() -> Self {
        Self {
            cnt: 0.0,
            player: Player::new(),
            enemies: Vec::new(),
            pbuls: Vec::new(),
            ebuls: Vec::new(),
            graze_cnt: 0,
        }
    }
}

impl Scene for GameScene {
    fn update(&mut self, app: &mut SStarApp, ginf: &mut GameInfo) -> Option<Box<dyn Scene>> {
        // DEBUG:
        if self.cnt as usize % 30 == 0 {
            self.ebuls.push(Bullet {
                btype: btype::CIRCLE,
                cnt: 0.0,
                x: 0.0,
                y: -100.0,
                spd: 3.0,
                deg: 90.0,
                dmg: 0.0,
                grazed: false,
                update_fun: |_, _, _| {},
            });
        }

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
            if n.update(ginf, &mut new_ebuls) {
                new_enemies.push(n.clone());
            }
        }
        self.enemies = new_enemies;
        // enemy bullets
        for n in self.ebuls.iter_mut() {
            if n.update(ginf, &mut new_ebuls) {
                if n.is_grazed(self.player.x, self.player.y, ginf.r) {
                    self.graze_cnt += 1;
                }
                if n.is_hit(self.player.x, self.player.y, ginf.r) {
                    sstar::log::ss_debug("hit!");
                } else {
                    new_ebuls.push(n.clone());
                }
            }
        }
        self.ebuls = new_ebuls;

        // bind a bitmap texture for game
        app.bind_texture(TextureID::Game as usize);

        // entities
        app.bind_texture(TextureID::Default as usize); // TODO:
        self.player.draw(app, ginf);
        self.enemies.iter().for_each(|n| n.draw(app, ginf));
        app.bind_texture(TextureID::Game as usize); // TODO:
        self.pbuls.iter().for_each(|n| n.draw(app));
        self.ebuls.iter().for_each(|n| n.draw(app));

        // frame
        app.draw(
            PushConstant {
                scl: [2048.0, 2048.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::TopLeftUI,
        );

        // info
        if ginf.should_show_info {
            // collisions
            self.player.draw_collision(app, ginf);
            // TODO: enemy collision
            for n in self.pbuls.iter() {
                n.draw_collision(app);
            }
            for n in self.ebuls.iter() {
                n.draw_collision(app);
            }
            // info
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
        self.cnt += ginf.clock_coef; // TODO:
        None
    }
}
