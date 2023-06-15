use super::game::GameScene;
use super::*;

use sstar::{log::*, window::Keycode};

const SELECT_CNT: usize = 4;

pub struct TitleScene {
    cursor: usize,
}

impl TitleScene {
    pub fn new() -> Self {
        Self { cursor: 0 }
    }
}

impl Scene for TitleScene {
    fn update(&mut self, app: &mut SStarApp) -> (Option<Box<dyn Scene>>, bool) {
        // move cursor
        if app.get_input(Keycode::Down) == 1 {
            self.cursor += 1;
        } else if app.get_input(Keycode::Up) == 1 {
            self.cursor += SELECT_CNT - 1;
        }

        // press z
        if app.get_input(Keycode::KeyZ) == 1 {
            // TODO: change scene with fadeout
            match self.cursor % SELECT_CNT {
                // TODO: practice
                0 => {
                    // TODO: go to practice scene
                    return (Some(Box::new(GameScene::new())), false);
                }
                // TODO: story
                1 => (),
                // TODO: settings
                2 => (),
                // quit
                3 => return (None, true),
                _ => ss_error("unexpected error occured with cursor value."),
            }
        }

        // finish
        (None, false)
    }
}
