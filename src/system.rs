mod general;
pub mod graphics;
pub mod input;

use sstar::{vulkan::*, window::*};
use std::collections::HashMap;

pub struct System {
    /// A constant for adjusting the value of PushConstants based on the runtime scene size.
    /// It is 1.0 when the scene size is 1280x960.
    scene_scale: f32,
    window_app: WindowApp,
    vulkan_app: VulkanApp,
    /// A hashmap to get a user configured joystick keycode from a keyboard keycode.
    js_map: HashMap<Keycode, Keycode>,
    /// It is passed to the VulkanApp::render method.
    /// It is set to None every frame.
    ub: Option<UniformBuffer>,
    /// It is passed to the VulkanApp::render method.
    /// It is cleared every frame.
    tasks: Vec<RenderTask>,
}
