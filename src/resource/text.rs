pub struct Text {
    pub tid: usize,
    pub size: f32,
    pub text: &'static str,
}

pub const TXT_SELECT_SETTING: Text = Text {
    tid: 0,
    size: 32.0,
    text: "Setting",
};

pub const TXT_SELECT_ASSEMBLE: Text = Text {
    tid: 1,
    size: 32.0,
    text: "Assemble",
};

pub struct TextTexture {
    pub id: usize,
    pub texts: &'static [Text],
}

pub const TXT_TEXTURE_SELECT: TextTexture = TextTexture {
    id: 1000,
    texts: &[TXT_SELECT_SETTING, TXT_SELECT_ASSEMBLE],
};
