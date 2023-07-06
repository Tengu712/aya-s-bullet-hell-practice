const FRAC_64: f32 = 0.03125;

#[derive(Clone)]
pub struct BulletType {
    pub(super) scl: [f32; 4],
    pub(super) uv: [f32; 4],
    pub(super) r: f32,
    pub(super) gr: f32,
}

pub const CIRCLE: BulletType = BulletType {
    scl: [32.0, 32.0, 1.0, 0.0],
    uv: [FRAC_64 * 1.0, 0.5, FRAC_64 * 2.0, 0.5 + FRAC_64],
    r: 6.0,
    gr: 64.0,
};

pub const DUAL_CIRCLE: BulletType = BulletType {
    scl: [32.0, 32.0, 1.0, 0.0],
    uv: [FRAC_64 * 2.0, 0.5, FRAC_64 * 2.0, 0.5 + FRAC_64],
    r: 6.0,
    gr: 64.0,
};

pub const TINY: BulletType = BulletType {
    scl: [8.0, 8.0, 1.0, 0.0],
    uv: [FRAC_64 * 3.0, 0.5, FRAC_64 * 3.0, 0.5 + FRAC_64],
    r: 6.0,
    gr: 64.0,
};

pub const RICE: BulletType = BulletType {
    scl: [16.0, 16.0, 1.0, 0.0],
    uv: [FRAC_64 * 4.0, 0.5, FRAC_64 * 4.0, 0.5 + FRAC_64],
    r: 6.0,
    gr: 64.0,
};
