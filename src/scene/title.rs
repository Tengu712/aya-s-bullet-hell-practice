use super::game::GameScene;
use super::*;

use crate::resource::*;

use sstar::{log::*, window::Keycode};

const SELECT_CNT: usize = 4;
const FADE_CNT: usize = 30;

pub struct TitleScene {
    cnt: usize,
    cursor: usize,
}

impl TitleScene {
    pub fn new() -> Self {
        Self { cnt: 0, cursor: 0 }
    }
}

impl Scene for TitleScene {
    fn update(&mut self, app: &mut SStarApp, ginf: &mut GameInfo) -> Option<Box<dyn Scene>> {
        // move cursor
        if app.get_input(Keycode::Down) == 1 {
            self.cursor += 1;
        } else if app.get_input(Keycode::Up) == 1 {
            self.cursor += SELECT_CNT - 1;
        }

        // press z
        if app.get_input(Keycode::KeyZ) == 1 && self.cnt >= FADE_CNT {
            // TODO: change scene with fadeout
            match self.cursor % SELECT_CNT {
                // TODO: practice
                0 => {
                    // TODO: go to practice scene
                    return Some(Box::new(GameScene::new()));
                }
                // TODO: story
                1 => (),
                // TODO: settings
                2 => (),
                // quit
                3 => {
                    ginf.is_running = false;
                    return None;
                }
                _ => ss_error("unexpected error occured with cursor value."),
            }
        }

        // fade in
        if self.cnt < FADE_CNT {
            app.bind_texture(TextureID::Default as usize);
            app.draw(
                PushConstant {
                    scl: [1280.0, 960.0, 1.0, 0.0],
                    col: [
                        1.0,
                        1.0,
                        1.0,
                        (FADE_CNT - self.cnt) as f32 / FADE_CNT as f32,
                    ],
                    ..Default::default()
                },
                Position::Center,
            );
        }

        // finish
        self.cnt += 1;
        None
    }
}
