use super::game::GameScene;
use super::*;

use crate::resource::*;

use sstar::{log::*, window::Keycode};

const SELECT_CNT: usize = 5;
const FADEIN_CNT: usize = 40;
const FADEOUT_CNT: usize = 30;
const FLASHING_CNT: usize = 40;

enum State {
    FadeIn(usize),
    Normal,
    Flashing(usize),
    FadeOut(usize),
}

pub struct TitleScene {
    state: State,
    cnt: usize,
    cursor: usize,
}

impl TitleScene {
    pub fn new() -> Self {
        Self {
            state: State::FadeIn(0),
            cnt: 0,
            cursor: 0,
        }
    }
}

impl Scene for TitleScene {
    fn update(&mut self, app: &mut SStarApp, ginf: &mut GameInfo) -> Option<Box<dyn Scene>> {
        // update
        match self.state {
            State::FadeIn(n) => {
                if n >= FADEIN_CNT {
                    self.state = State::Normal;
                } else {
                    self.state = State::FadeIn(n + 1);
                }
            }
            State::Normal => self.update_normal(app),
            State::Flashing(n) => {
                if n >= FLASHING_CNT {
                    self.state = State::FadeOut(0);
                } else {
                    self.state = State::Flashing(n + 1);
                }
            }
            State::FadeOut(n) => {
                if n >= FADEOUT_CNT {
                    return self.get_next_scene(ginf);
                } else {
                    self.state = State::FadeOut(n + 1);
                }
            }
        }
        self.cnt += 1;

        // bind a bitmap texture for title
        app.bind_texture(TextureID::Title as usize);

        // bg
        app.draw(
            PushConstant {
                scl: [2048.0, 1024.0, 1.0, 0.0],
                ..Default::default()
            },
            Position::TopLeftUI,
        );

        // options
        for i in 0..5 {
            let x = 30.0 + 30.0 * i as f32;
            let y = 520.0 + 70.0 * i as f32;
            let vs = 0.0625 * i as f32;
            let vd = 0.0625 * (i + 1) as f32;
            let k = match self.state {
                State::Flashing(_) => 6.0,
                _ => 40.0,
            };
            let c = 0.6 * (self.cnt as f32 * std::f32::consts::PI / k).sin().abs() + 0.4;
            let col = if self.cursor % SELECT_CNT == i {
                [c, c, c, 1.0]
            } else {
                [0.6, 0.6, 0.6, 0.6]
            };
            app.draw(
                PushConstant {
                    scl: [512.0, 64.0, 1.0, 0.0],
                    trs: [x, y, 0.0, 0.0],
                    uv: [0.625, vs, 0.875, vd],
                    col,
                    ..Default::default()
                },
                Position::TopLeftUI,
            );
        }

        // fade in
        match self.state {
            State::FadeIn(n) => {
                app.bind_texture(TextureID::Default as usize);
                app.draw(
                    PushConstant {
                        scl: [1280.0, 960.0, 1.0, 0.0],
                        col: [1.0, 1.0, 1.0, (FADEIN_CNT - n) as f32 / FADEIN_CNT as f32],
                        ..Default::default()
                    },
                    Position::Center,
                );
            }
            _ => (),
        }

        // fade out
        match self.state {
            State::FadeOut(n) => {
                app.bind_texture(TextureID::Default as usize);
                app.draw(
                    PushConstant {
                        scl: [1280.0, 960.0, 1.0, 0.0],
                        col: [0.0, 0.0, 0.0, n as f32 / FADEOUT_CNT as f32],
                        ..Default::default()
                    },
                    Position::Center,
                );
            }
            _ => (),
        }

        // finish
        None
    }
}

impl TitleScene {
    fn update_normal(&mut self, app: &mut SStarApp) {
        // move cursor
        if app.get_input(Keycode::Down) == 1 {
            self.cursor += 1;
        } else if app.get_input(Keycode::Up) == 1 {
            self.cursor += SELECT_CNT - 1;
        }
        // press x
        if app.get_input(Keycode::KeyX) == 1 {
            self.cursor = SELECT_CNT - 1;
        }
        // press z
        if app.get_input(Keycode::KeyZ) == 1 {
            self.state = State::Flashing(0);
        }
    }

    fn get_next_scene(&mut self, ginf: &mut GameInfo) -> Option<Box<dyn Scene>> {
        match self.cursor % SELECT_CNT {
            // TODO: practice
            0 => Some(Box::new(GameScene::new())),
            // TODO: start
            // TODO: assemble
            // TODO: result
            4 => {
                ginf.is_running = false;
                None
            }
            _ => ss_error("unexpected error occured: TitleScene.cursor is invalid."),
        }
    }
}
