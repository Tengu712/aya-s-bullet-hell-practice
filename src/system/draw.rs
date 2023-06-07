use super::*;

use crate::resource::*;

use sstar::{bitmap::image::*, vulkan::image::*};

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
