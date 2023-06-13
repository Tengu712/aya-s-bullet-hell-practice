mod resource;
mod scene;
mod system;

use resource::*;
use scene::{title::TitleScene, Scene};

use sstar::vulkan::PushConstant;
use system::{graphics::Position, System};

fn main() {
    let mut system = System::new("射命丸文の弾幕稽古", 1280.0, 960.0, 10);

    load_resources(&mut system);

    let mut scene: Box<dyn Scene> = Box::new(TitleScene::new());

    system.run(move |system| {
        // update scene
        let (next, end) = scene.update(system);
        if let Some(next) = next {
            scene = next;
        }

        // draw fps
        system.bind_texture(TextureID::SystemChars as usize);
        system.draw_chars(
            PushConstant {
                trs: [1280.0, 960.0, 0.0, 0.0],
                ..Default::default()
            },
            Position::LowerRightUI,
            TextureID::SystemChars as usize,
            "00.0fps",
        );

        // render and go to next frame
        system.render();
        end
    });
}
