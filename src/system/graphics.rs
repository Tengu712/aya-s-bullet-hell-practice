use super::*;

use crate::resource::*;

use sstar::{bitmap::image::*, log::*, vulkan::image::*};

pub const BASE_SCENE_WIDTH: u32 = 1280;
pub const BASE_SCENE_HEIGHT: u32 = 960;
pub const BASE_SCENE_WIDTH_F32: f32 = BASE_SCENE_WIDTH as f32;
pub const BASE_SCENE_HEIGHT_F32: f32 = BASE_SCENE_HEIGHT as f32;

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

    // TODO: if the image texture has been already loaded, it returns without doing anything.
    pub fn load_image_texture(&mut self, img_tex: &ImageTexture) {
        let bitmap = create_bitmap_from_file(img_tex.path).unwrap();
        load_image_texture(
            &mut self.vulkan_app,
            img_tex.id,
            bitmap.width,
            bitmap.height,
            &bitmap.data,
        )
        .unwrap();
    }

    pub fn set_image_texture(&mut self, id: usize) {
        self.tasks.push(RenderTask::SetImageTexture(id));
    }
}
