use super::*;

use crate::resource::{image::*, text::*};

use sstar::{bitmap::image::*, log::*, vulkan::image::*};

pub const BASE_SCENE_WIDTH: u32 = 1280;
pub const BASE_SCENE_HEIGHT: u32 = 960;
pub const BASE_SCENE_WIDTH_F32: f32 = BASE_SCENE_WIDTH as f32;
pub const BASE_SCENE_HEIGHT_F32: f32 = BASE_SCENE_HEIGHT as f32;

pub(super) struct TextInfo {
    width: f32,
    height: f32,
    uv: [f32; 4],
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
    pub fn draw(&mut self, mut pc: PushConstant) {
        pc.scl[0] *= self.scene_scale;
        pc.scl[1] *= self.scene_scale;
        pc.trs[0] *= self.scene_scale;
        pc.trs[1] *= self.scene_scale;
        self.tasks.push(RenderTask::Draw(pc));
    }

    /// A method to push a task for drawing a rectangle that satisfies the following conditions:
    /// - The position of the rectangle is defined as its top left corner.
    /// - The rectangle is in a coordinate system where the top left of the screen is regarded as the origin.
    pub fn draw_ui(&mut self, mut pc: PushConstant) {
        pc.trs[0] += pc.scl[0] / 2.0 - BASE_SCENE_WIDTH_F32 / 2.0;
        pc.trs[1] += pc.scl[1] / 2.0 - BASE_SCENE_HEIGHT_F32 / 2.0;
        self.draw(pc);
    }

    /// A method to push a task for drawing a text.
    /// It calls System::draw_ui() internally.
    pub fn draw_text(&mut self, tid: usize, x: f32, y: f32) {
        if let Some(txt) = self.text_infos.get(&tid) {
            let pc = PushConstant {
                scl: [txt.width, txt.height, 1.0, 0.0],
                trs: [x, y, 0.0, 0.0],
                uv: txt.uv,
                ..Default::default()
            };
            self.draw_ui(pc);
        } else {
            ss_warning(&format!("text {tid} not loaded."));
        }
    }

    pub fn set_image_texture(&mut self, id: usize) {
        self.tasks.push(RenderTask::SetImageTexture(id));
    }

    // TODO: if the image texture has been already loaded, it returns without doing anything.
    pub fn load_image_texture(&mut self, img_tex: &ImageTexture) {
        let bitmap = create_bitmap_from_file(img_tex.path).unwrap_or_else(|e| ss_error(&e));
        load_image_texture(
            &mut self.vulkan_app,
            img_tex.id,
            bitmap.width,
            bitmap.height,
            &bitmap.data,
        )
        .unwrap_or_else(|e| ss_error(&e));
    }

    pub fn load_text_texture(&mut self, txt_tex: &TextTexture) {
        // rasterize glyphs
        let bitmap_infos = txt_tex
            .texts
            .iter()
            .map(|t| self.glyph_rasterizer.rasterize(t.text, t.size))
            .collect::<Vec<_>>();

        // create a empty bitmap
        let width = bitmap_infos.iter().map(|n| n.width).max().unwrap();
        let width = 2_usize.pow((width as f64).log2().ceil() as u32);
        let height = bitmap_infos.iter().map(|n| n.height).sum::<u32>();
        let height = 2_usize.pow((height as f64).log2().ceil() as u32);
        let mut bitmap = vec![0; width * height * 4];

        // map
        let mut oy = 0;
        for (cnt, info) in bitmap_infos.into_iter().enumerate() {
            for j in 0..(info.height as usize) {
                for i in 0..(info.width as usize) {
                    let idx = (j + oy) * width + i;
                    bitmap[idx * 4 + 0] = 255;
                    bitmap[idx * 4 + 1] = 255;
                    bitmap[idx * 4 + 2] = 255;
                    bitmap[idx * 4 + 3] = info.data[j * info.width as usize + i];
                }
            }
            let width = width as f32;
            let height = height as f32;
            let new_oy = oy + info.height as usize;
            self.text_infos.insert(
                txt_tex.texts[cnt].tid,
                TextInfo {
                    width: info.width as f32,
                    height: info.height as f32,
                    uv: [
                        0.0,
                        oy as f32 / height,
                        info.width as f32 / width,
                        new_oy as f32 / height,
                    ],
                },
            );
            oy = new_oy;
        }

        // load
        load_image_texture(
            &mut self.vulkan_app,
            txt_tex.id,
            width as u32,
            height as u32,
            &bitmap,
        )
        .unwrap_or_else(|e| ss_error(&e));
    }
}
