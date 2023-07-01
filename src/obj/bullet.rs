use crate::GameInfo;

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
};

#[derive(Clone)]
pub struct Bullet {
    pub x: f32,
    pub y: f32,
    pub spd: f32,
    pub deg: f32,
}

impl Bullet {
    /// If it should be removed, it returns `false`.
    pub fn update(&mut self, ginf: &GameInfo, _: &mut Vec<Bullet>) -> bool {
        let rad = self.deg.to_radians();
        let dx = rad.cos();
        let dy = rad.sin();
        self.x += dx * self.spd * ginf.clock_coef;
        self.y += dy * self.spd * ginf.clock_coef;
        if self.x.abs() > 500.0 || self.y.abs() > 500.0 {
            false
        } else {
            true
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
