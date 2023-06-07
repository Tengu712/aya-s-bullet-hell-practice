pub struct ImageTexture {
    pub id: usize,
    pub path: &'static str,
}

pub const IMG_TEX_GAME: ImageTexture = ImageTexture {
    id: 100,
    path: "./res/game.png",
};
