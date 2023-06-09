use super::*;

use crate::resource::*;

use sstar::{bitmap::image::*, log::*, vulkan::image::*};

impl System {
    pub(super) fn load_resources_first_frame(&mut self) {
        // TODO: loadscene background
        // self.img(TextureID::Load, "./res/load.png");
    }

    pub(super) fn load_resources(&mut self) {
        // images
        self.img(TextureID::Game, "./res/game.png");

        // texts
        self.txt(TextureID::SystemCharactors, 32.0, SYSTEM_CHARACTORS);
        self.txt(TextureID::SelectText, 32.0, SELECT_TEXT);
    }

    fn img(&mut self, id: TextureID, path: &str) {
        let bitmap = create_bitmap_from_file(path).unwrap_or_else(|e| ss_error(&e));
        load_image_texture(
            &mut self.vulkan_app,
            id as usize,
            bitmap.width,
            bitmap.height,
            &bitmap.data,
        )
        .unwrap_or_else(|e| ss_error(&e));
    }

    fn txt(&mut self, id: TextureID, size: f32, txts: &[&str]) {
        // rasterize glyphs
        let bitmap_infos = txts
            .iter()
            .map(|t| (t.to_string(), self.glyph_rasterizer.rasterize(t, size)))
            .collect::<Vec<_>>();

        // create a empty bitmap
        let width = bitmap_infos.iter().map(|(_, n)| n.width).max().unwrap();
        let width = 2_usize.pow((width as f64).log2().ceil() as u32);
        let height = bitmap_infos.iter().map(|(_, n)| n.height).sum::<u32>();
        let height = 2_usize.pow((height as f64).log2().ceil() as u32);
        let mut bitmap = vec![0; width * height * 4];

        // map
        let mut oy = 0;
        for (key, info) in bitmap_infos {
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
                key,
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
            id as usize,
            width as u32,
            height as u32,
            &bitmap,
        )
        .unwrap_or_else(|e| ss_error(&e));
    }
}
