mod general;
pub mod graphics;
pub mod input;
mod load;

use sstar::{bitmap::font::*, vulkan::*, window::*};
use std::collections::HashMap;

struct TextInfo {
    width: f32,
    height: f32,
    uv: [f32; 4],
}

pub struct System {
    /// A constant for adjusting the value of PushConstants based on the runtime scene size.
    /// It is 1.0 when the scene size is 1280x960.
    scene_scale: f32,
    window_app: WindowApp,
    vulkan_app: VulkanApp,
    glyph_rasterizer: GlyphRasterizer,
    text_infos: HashMap<String, TextInfo>,
    /// A hashmap to get a user configured joystick keycode from a keyboard keycode.
    js_map: HashMap<Keycode, Keycode>,
    /// It is passed to the VulkanApp::render method.
    /// It is set to None every frame.
    ub: Option<UniformBuffer>,
    /// It is passed to the VulkanApp::render method.
    /// It is cleared every frame.
    tasks: Vec<RenderTask>,
}
