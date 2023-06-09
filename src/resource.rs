pub enum TextureID {
    // image
    Load = 1,
    Game,
    // text
    SystemCharactors,
    SelectText,
}

pub const SYSTEM_CHARACTORS: &'static [&'static str] = &[
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "f", "p", "s",
];

pub const SELECT_TEXT: &'static [&'static str] = &["Assemble", "Settings"];
