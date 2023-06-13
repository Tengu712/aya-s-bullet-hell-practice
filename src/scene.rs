pub mod game;
pub mod title;

use crate::system::System;

pub trait Scene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool);
}
