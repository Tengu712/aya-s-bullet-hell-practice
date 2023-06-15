mod resource;
mod scene;

use resource::*;
use scene::{title::TitleScene, Scene};

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
};

fn main() {
    let mut app = SStarApp::new("射命丸文の弾幕稽古", 1280.0, 960.0, 10);

    load_resources(&mut app);

    let mut scene: Box<dyn Scene> = Box::new(TitleScene::new());

    while app.update() {
        // update scene
        let (next, end) = scene.update(&mut app);
        if let Some(next) = next {
            scene = next;
        }
        if end {
            break;
        }

        // draw fps
        app.bind_texture(TextureID::SystemChars as usize);
        app.draw_chars(
            PushConstant {
                trs: [1280.0, 960.0, 0.0, 0.0],
                ..Default::default()
            },
            Position::LowerRightUI,
            TextureID::SystemChars as usize,
            "00.0fps",
        );

        // render and go to next frame
        app.flush();
    }

    app.terminate();
}
