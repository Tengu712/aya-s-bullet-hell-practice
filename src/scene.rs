pub mod game;

use crate::system::System;

pub trait Scene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool);
}
