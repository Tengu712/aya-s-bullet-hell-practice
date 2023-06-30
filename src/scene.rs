pub mod game;
pub mod title;

use super::*;

use sstar::app::SStarApp;

pub trait Scene {
    fn update(&mut self, app: &mut SStarApp, ginf: &mut GameInfo) -> Option<Box<dyn Scene>>;
}
