pub mod btype;

use super::*;

use crate::GameInfo;

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
};

use btype::*;

#[derive(Clone)]
pub struct Bullet {
    pub btype: BulletType,
    pub cnt: f32,
    pub x: f32,
    pub y: f32,
    pub spd: f32,
    pub deg: f32,
    pub dmg: f32,
    pub grazed: bool,
    /// to change spd and deg
    pub update_fun: fn(&mut Bullet, &GameInfo, &mut Vec<Bullet>),
}

impl Bullet {
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

    pub fn draw(&self, app: &mut SStarApp) {
        app.draw(
            PushConstant {
                scl: self.btype.scl,
                trs: [self.x, self.y, 0.0, 0.0],
                uv: self.btype.uv,
                ..Default::default()
            },
            Position::Center,
        );
    }

    pub fn draw_collision(&self, app: &mut SStarApp) {
        app.draw(
            PushConstant {
                scl: [2.0 * self.btype.r, 2.0 * self.btype.r, 1.0, 0.0],
                trs: [self.x, self.y, 0.0, 0.0],
                uv: UV_COLLISION,
                ..Default::default()
            },
            Position::Center,
        );
    }

    pub fn is_hit(&self, x: f32, y: f32, r: f32) -> bool {
        let dx = self.x - x;
        let dy = self.y - y;
        let d = dx * dx + dy * dy;
        let r = r + self.btype.r;
        d < r * r
    }

    pub fn is_grazed(&mut self, x: f32, y: f32, r: f32) -> bool {
        if self.grazed {
            return false;
        }
        self.grazed = true;
        let dx = self.x - x;
        let dy = self.y - y;
        let d = dx * dx + dy * dy;
        let r = r + self.btype.gr;
        d < r * r
    }
}
