use super::*;

use crate::resource::TextureID;

use sstar::log::*;

pub const BASE_SCENE_WIDTH: u32 = 1280;
pub const BASE_SCENE_HEIGHT: u32 = 960;
pub const BASE_SCENE_WIDTH_F32: f32 = BASE_SCENE_WIDTH as f32;
pub const BASE_SCENE_HEIGHT_F32: f32 = BASE_SCENE_HEIGHT as f32;

#[derive(Clone)]
pub enum Position {
    Center,
    CenterUI,
    UpperLeftUI,
    LowerRightUI,
}

pub(super) fn configure(settings: &HashMap<String, String>) -> (f32, u32, u32) {
    let scene_scale = settings
        .get("window-scale")
        .unwrap_or_else(|| ss_error("window-scale is not found in settings.cfg."))
        .parse::<f32>()
        .unwrap_or_else(|_| ss_error("window-scale is not a float number."));
    (
        scene_scale,
        (BASE_SCENE_WIDTH_F32 * scene_scale) as u32,
        (BASE_SCENE_HEIGHT_F32 * scene_scale) as u32,
    )
}

impl System {
    /// A method to push a task for drawing a rectangle.
    /// The size of the rectangle is automaticaly scaled based on the scene size.
    pub fn draw(&mut self, mut pc: PushConstant, pos: Position) {
        match pos {
            Position::Center => (),
            Position::CenterUI => {
                pc.trs[0] -= BASE_SCENE_WIDTH_F32 / 2.0;
                pc.trs[1] -= BASE_SCENE_HEIGHT_F32 / 2.0;
            }
            Position::UpperLeftUI => {
                pc.trs[0] += pc.scl[0] / 2.0 - BASE_SCENE_WIDTH_F32 / 2.0;
                pc.trs[1] += pc.scl[1] / 2.0 - BASE_SCENE_HEIGHT_F32 / 2.0;
            }
            Position::LowerRightUI => {
                pc.trs[0] += -pc.scl[0] / 2.0 - BASE_SCENE_WIDTH_F32 / 2.0;
                pc.trs[1] += -pc.scl[1] / 2.0 - BASE_SCENE_HEIGHT_F32 / 2.0;
            }
        }
        pc.scl[0] *= self.scene_scale;
        pc.scl[1] *= self.scene_scale;
        pc.trs[0] *= self.scene_scale;
        pc.trs[1] *= self.scene_scale;
        self.tasks.push(RenderTask::Draw(pc));
    }

    /// A method to push a task for drawing a text.
    /// It calls System::draw_ui() internally.
    pub fn draw_text(&mut self, txt: &str, x: f32, y: f32, pos: Position) {
        if let Some(txt) = self.text_infos.get(txt) {
            let pc = PushConstant {
                scl: [txt.width, txt.height, 1.0, 0.0],
                trs: [x, y, 0.0, 0.0],
                uv: txt.uv,
                ..Default::default()
            };
            self.draw(pc, pos);
        } else {
            ss_warning(&format!("text texture '{txt}' not loaded."));
        }
    }

    /// A method to push a task for drawing a text directly.
    /// It calls System::draw_ui() internally.
    pub fn draw_text_directly(&mut self, txt: &str, x: f32, y: f32, pos: Position) {
        let mut ox = 0.0;
        let mut pcs = Vec::with_capacity(txt.chars().count());
        for c in txt.chars() {
            let txt = c.to_string();
            if let Some(txt) = self.text_infos.get(&txt) {
                let pc = PushConstant {
                    scl: [txt.width, txt.height, 1.0, 0.0],
                    trs: [x + ox, y, 0.0, 0.0],
                    uv: txt.uv,
                    ..Default::default()
                };
                pcs.push(pc);
                ox += txt.width;
            } else {
                ss_warning(&format!("text texture '{txt}' not loaded."));
            }
        }
        for mut pc in pcs {
            match pos {
                Position::Center |
                Position::CenterUI => {
                    pc.trs[0] -= ox / 2.0;
                    pc.trs[1] -= pc.scl[1] / 2.0;
                },
                Position::UpperLeftUI => (),
                Position::LowerRightUI => {
                    pc.trs[0] -= ox;
                    pc.trs[1] -= pc.scl[1];
                },
            }
            self.draw(pc, Position::UpperLeftUI);
        }
    }

    pub fn set_image_texture(&mut self, id: TextureID) {
        self.tasks.push(RenderTask::SetImageTexture(id as usize));
    }
}
