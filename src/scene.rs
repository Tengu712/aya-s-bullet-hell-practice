pub mod game;
pub mod load;

use crate::system::System;

pub trait Scene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool);
    fn terminate(&mut self, system: &mut System);
}
