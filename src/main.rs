mod resource;
mod scene;

use resource::*;
use scene::{title::TitleScene, Scene};

use sstar::{
    app::{graphics::Position, SStarApp},
    vulkan::PushConstant,
};
use std::time;

pub struct GameInfo {
    pub is_running: bool,
}

fn main() {
    let mut app = SStarApp::new("射命丸文の弾幕稽古", 1280.0, 960.0, 10);
    load_resources(&mut app);

    let mut ginf = GameInfo { is_running: true };

    let mut scene: Box<dyn Scene> = Box::new(TitleScene::new());
    let mut cnt = 0;
    let mut now = time::Instant::now();
    let mut fps = String::from("0.00fps");

    while app.update() {
        // calculate fps
        cnt += 1;
        let duration = now.elapsed();
        if duration.as_secs() >= 1 {
            let fps_f64 = (cnt * 1000000) as f64 / duration.as_micros() as f64;
            cnt = 0;
            now = time::Instant::now();
            fps = format!("{:03.1}fps", fps_f64);
        }

        // update scene
        if let Some(n) = scene.update(&mut app, &mut ginf) {
            scene = n;
        }
        if !ginf.is_running {
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
            &fps,
        );

        // render and go to next frame
        app.flush();
    }

    app.terminate();
}
