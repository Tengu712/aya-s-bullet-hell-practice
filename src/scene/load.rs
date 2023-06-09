use super::game::GameScene;
use super::*;

use crate::resource::{image::*, text::*};

pub struct LoadScene {
    loading: bool,
}

impl LoadScene {
    pub fn new() -> Self {
        Self { loading: false }
    }
}

impl Scene for LoadScene {
    fn update(&mut self, system: &mut System) -> (Option<Box<dyn Scene>>, bool) {
        if self.loading {
            // TODO: load background
            // TODO: draw background
            self.loading = true;
            return (None, false);
        }

        // text
        system.load_text_texture(&TXT_TEXTURE_SELECT);

        // image
        system.load_image_texture(&IMG_TEX_GAME);

        // TODO: draw background

        // finish
        (Some(Box::new(GameScene::new())), false)
    }

    fn terminate(&mut self, _: &mut System) {
        // TODO: unload background.
        // system.unload_image_texture(&IMG_TEX_LOAD);
    }
}
