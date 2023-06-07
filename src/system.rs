mod draw;
mod general;

use sstar::{vulkan::*, window::*};

pub const BASE_SCENE_WIDTH: u32 = 1280;
pub const BASE_SCENE_HEIGHT: u32 = 960;
pub const BASE_SCENE_WIDTH_F32: f32 = BASE_SCENE_WIDTH as f32;
pub const BASE_SCENE_HEIGHT_F32: f32 = BASE_SCENE_HEIGHT as f32;

pub struct System {
    /// A constant for adjusting the value of PushConstants based on the runtime scene size.
    /// It is 1.0 when the scene size is 1280x960.
    scene_scale: f32,
    window_app: WindowApp,
    vulkan_app: VulkanApp,
    /// It is passed to the VulkanApp::render method.
    /// It is set to None every frame.
    ub: Option<UniformBuffer>,
    /// It is passed to the VulkanApp::render method.
    /// It is cleared every frame.
    tasks: Vec<RenderTask>,
}
