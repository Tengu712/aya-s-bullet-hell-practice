use sstar::{
    app::{graphics::Position, SStarApp},
    bitmap::font::GlyphRasterizer,
    log::*,
    vulkan::PushConstant,
};

pub enum TextureID {
    // image
    Default = 0,
    Load,
    Game,
    // text
    SystemChars,
    SelectText,
}

pub const SYSTEM_CHARS: &'static [&'static str] = &[
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i",
    "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", ".", ":",
    " ",
];

pub const SELECT_TEXT: &'static [&'static str] = &["Assemble", "Settings"];

pub fn load_resources(app: &mut SStarApp) {
    // load a background for loading scene
    app.load_image(TextureID::Load as usize, "./res/load.png");
    // draw the background
    app.bind_texture(TextureID::Load as usize);
    app.draw(
        PushConstant {
            scl: [2048.0, 1024.0, 1.0, 1.0],
            ..Default::default()
        },
        Position::UpperLeftUI,
    );
    app.flush();

    // images
    app.load_image(TextureID::Game as usize, "./res/game.png");
    // texts
    let gr = GlyphRasterizer::new("./res/mplus-2p-medium.ttf").unwrap_or_else(|e| ss_error(&e));
    app.load_texts(&gr, TextureID::SystemChars as usize, 32.0, SYSTEM_CHARS);
    app.load_texts(&gr, TextureID::SelectText as usize, 32.0, SELECT_TEXT);

    // finish
    app.unload_texture(TextureID::Load as usize);
}
