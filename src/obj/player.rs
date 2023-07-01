use super::bullet::Bullet;

use crate::GameInfo;

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
    window::Keycode,
};

pub struct Player {
    x: f32,
    y: f32,
    shoot_cnt: f32,
}

impl Player {
    pub fn new() -> Self {
        Self {
            x: 0.0,
            y: 0.0,
            shoot_cnt: 0.0,
        }
    }

    pub fn update(&mut self, app: &SStarApp, ginf: &GameInfo, buls: &mut Vec<Bullet>) {
        // move
        let l = app.get_input(Keycode::Left);
        let r = app.get_input(Keycode::Right);
        let u = app.get_input(Keycode::Up);
        let d = app.get_input(Keycode::Down);
        let lr: f32 = if l > 0 && r == 0 {
            -1.0
        } else if l == 0 && r > 0 {
            1.0
        } else {
            0.0
        };
        let ud: f32 = if u > 0 && d == 0 {
            -1.0
        } else if u == 0 && d > 0 {
            1.0
        } else {
            0.0
        };
        let k = if lr.abs() > 0.0 && ud.abs() > 0.0 {
            std::f32::consts::FRAC_1_SQRT_2
        } else {
            1.0
        };
        let s = if app.get_input(Keycode::Shift) > 0 {
            ginf.spd_s
        } else {
            ginf.spd_n
        };
        self.x += lr * k * s * ginf.clock_coef;
        self.y += ud * k * s * ginf.clock_coef;
        // TODO: clamp

        // shoot
        if self.shoot_cnt != 0.0 {
            if self.shoot_cnt > ginf.shoot_interval {
                self.shoot_cnt = 0.0;
            } else {
                self.shoot_cnt += ginf.clock_coef;
            }
        }
        if app.get_input(Keycode::KeyZ) > 0 && self.shoot_cnt == 0.0 {
            buls.push(Bullet { x: self.x, y: self.y, spd: 40.0, deg: 270.0 });
            self.shoot_cnt += ginf.clock_coef;
        }
    }

    pub fn draw(&self, app: &mut SStarApp, _: &GameInfo) {
        app.draw(
            PushConstant {
                scl: [40.0, 60.0, 1.0, 0.0],
                trs: [self.x, self.y, 0.0, 0.0],
                ..Default::default()
            },
            Position::Center,
        );
    }
}
