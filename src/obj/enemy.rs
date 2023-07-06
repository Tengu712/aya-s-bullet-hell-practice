use super::bullet::Bullet;
use super::*;

use crate::GameInfo;

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
};

#[derive(Clone)]
pub struct Enemy {
    pub cnt: f32,
    pub hp: isize,
    pub x: f32,
    pub y: f32,
    pub spd: f32,
    pub deg: f32,
    /// to change spd and deg
    pub update_fun: fn(&mut Enemy, &GameInfo, &mut Vec<Bullet>),
}

impl Enemy {
    /// If it should be removed, it returns `false`.
    pub fn update(&mut self, ginf: &GameInfo, buls: &mut Vec<Bullet>) -> bool {
        (self.update_fun)(self, ginf, buls);
        let rad = self.deg.to_radians();
        let dx = rad.cos();
        let dy = rad.sin();
        self.x += dx * self.spd * ginf.clock_coef;
        self.y += dy * self.spd * ginf.clock_coef;
        self.cnt += ginf.clock_coef;
        if self.x.abs() > BORDER_X || self.y.abs() > BORDER_Y {
            false
        } else {
            true
        }
    }

    pub fn draw(&self, app: &mut SStarApp, _: &GameInfo) {
        app.draw(
            PushConstant {
                scl: [64.0, 64.0, 1.0, 0.0],
                trs: [self.x, self.y, 0.0, 0.0],
                ..Default::default()
            },
            Position::Center,
        );
    }
}
