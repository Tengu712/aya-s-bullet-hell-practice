pub mod game;
pub mod title;

use sstar::app::SStarApp;

pub trait Scene {
    fn update(&mut self, app: &mut SStarApp) -> (Option<Box<dyn Scene>>, bool);
}
