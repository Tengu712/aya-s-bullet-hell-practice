const std = @import("std");
// NOTE: 他モジュールでも共有できるようpubにする。
pub const vk = @cImport({
    @cDefine("VK_USE_PLATFORM_WIN32_KHR", "");
    @cInclude("vulkan/vulkan.h");
});
const ui = @import("ui.zig");
const gc = @import("../gc.zig");
const windows = @import("../window/windows.zig");

const ALLOCATOR = std.heap.page_allocator;
const INSTANCE_ENABLED_LAYER_NAMES = [_][*c]const u8{"VK_LAYER_KHRONOS_validation"};
const INSTANCE_ENABLED_LAYER_COUNT = INSTANCE_ENABLED_LAYER_NAMES.len;
const INSTANCE_ENABLED_EXTENSION_NAMES = [_][*c]const u8{ "VK_KHR_surface", "VK_KHR_win32_surface" };
const INSTANCE_ENABLED_EXTENSION_COUNT = INSTANCE_ENABLED_EXTENSION_NAMES.len;
const DEVICE_ENABLED_LAYER_NAMES = [_][*c]const u8{};
const DEVICE_ENABLED_LAYER_COUNT = DEVICE_ENABLED_LAYER_NAMES.len;
const DEVICE_ENABLED_EXTENSION_NAMES = [_][*c]const u8{"VK_KHR_swapchain"};
const DEVICE_ENABLED_EXTENSION_COUNT = DEVICE_ENABLED_EXTENSION_NAMES.len;
const RENDER_TARGET_PIXEL_FORMAT = vk.VK_FORMAT_B8G8R8A8_SRGB;
const RENDER_TARGET_COLOR_SPACE = vk.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
const SWAPCHAIN_IMAGE_COUNT = 2;

pub const Error = error{
    InstanceCreation,
    PhysicalDeviceAcquisition,
    QueueFamilyAcquisition,
    DeviceCreation,
    CommandPoolCreation,
    SurfaceCreation,
    InvalidSurface,
    SwapchainCreation,
    SwapchainImageViewCreation,
    SemaphoreCreation,
    RenderPassCreation,
    FramebuffersCreation,
    CommandBufferCreation,
    CommandBufferStarting,
    CommandBufferEnding,
    Submittion,
    Presentation,
    MemoryAllocation,
    MemoryUpdating,
    BufferCreation,
    ModelCreation,
};

/// デバイスメモリを管理するオブジェクト
pub const Memory = struct {
    device_memory: vk.VkDeviceMemory,

    pub fn new(
        vapp: VulkanApp,
        flags: vk.VkMemoryPropertyFlags,
        memory_type: u32,
        size: vk.VkDeviceSize,
    ) Error!Memory {
        var index: u32 = 0;
        // NOTE: 1 << indexとするとLHS of shift must be a fixed-width integer type, or RHS must be comptime-knownと怒られるので。
        //       @as(u32, i) << indexとするとexpected type 'u5', found 'u32'と怒られるので。
        var memory_type_b: u32 = 1;
        for (vapp.physical_device_memory_properties.memoryTypes) |n| {
            if (index >= vapp.physical_device_memory_properties.memoryTypeCount) {
                return error.MemoryAllocation;
            }
            if (memory_type_b & memory_type > 0 and (n.propertyFlags & flags) == flags) {
                break;
            }
            index += 1;
            memory_type_b *= 2;
        }

        const ai = vk.VkMemoryAllocateInfo{
            .sType = vk.VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO,
            .pNext = null,
            .allocationSize = size,
            .memoryTypeIndex = @intCast(index),
        };
        var device_memory: vk.VkDeviceMemory = null;
        if (vk.vkAllocateMemory(vapp.device, &ai, null, &device_memory) != vk.VK_SUCCESS) {
            return error.MemoryAllocation;
        }

        return .{ .device_memory = device_memory };
    }

    pub fn destroy(self: @This(), vapp: VulkanApp) void {
        vk.vkFreeMemory(vapp.device, self.device_memory, null);
    }

    pub fn update(self: @This(), vapp: VulkanApp, comptime T: type, source: []const T) Error!void {
        // NOTE: memcpyを使うため。
        //       スコープを狭くしたいのでここで。
        const c = @cImport(@cInclude("string.h"));
        var p: [*]usize = undefined;
        if (vk.vkMapMemory(vapp.device, self.device_memory, 0, vk.VK_WHOLE_SIZE, 0, @ptrCast(&p)) != vk.VK_SUCCESS) {
            return error.MemoryUpdating;
        }
        _ = c.memcpy(@ptrCast(p), @ptrCast(source.ptr), @sizeOf(T) * source.len);
        vk.vkUnmapMemory(vapp.device, self.device_memory);
    }
};

/// バッファを管理するオブジェクト
pub const Buffer = struct {
    buffer: vk.VkBuffer,
    memory: Memory,
    memory_requirements: vk.VkMemoryRequirements,

    pub fn new(
        vapp: VulkanApp,
        flags: vk.VkMemoryPropertyFlags,
        usage: vk.VkBufferUsageFlags,
        size: vk.VkDeviceSize,
    ) Error!Buffer {
        const ci = vk.VkBufferCreateInfo{
            .sType = vk.VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .size = size,
            .usage = usage,
            .sharingMode = vk.VK_SHARING_MODE_EXCLUSIVE,
            .queueFamilyIndexCount = 0,
            .pQueueFamilyIndices = null,
        };
        var buffer: vk.VkBuffer = null;
        if (vk.vkCreateBuffer(vapp.device, &ci, null, &buffer) != vk.VK_SUCCESS) {
            return error.BufferCreation;
        }

        var memory_requirements: vk.VkMemoryRequirements = undefined;
        vk.vkGetBufferMemoryRequirements(vapp.device, buffer, &memory_requirements);

        const memory = try Memory.new(vapp, flags, memory_requirements.memoryTypeBits, size);
        if (vk.vkBindBufferMemory(vapp.device, buffer, memory.device_memory, 0) != vk.VK_SUCCESS) {
            return error.BufferCreation;
        }

        return .{
            .buffer = buffer,
            .memory = memory,
            .memory_requirements = memory_requirements,
        };
    }

    pub fn destroy(self: @This(), vapp: VulkanApp) void {
        self.memory.destroy(vapp);
        vk.vkDestroyBuffer(vapp.device, self.buffer, null);
    }
};

/// 正方形モデルのデータのための構造体
pub const Model = struct {
    vertex_buffer: Buffer,
    index_buffer: Buffer,
    indices_count: u32,

    fn new(vapp: VulkanApp) Error!Model {
        const vertices = [_]f32{
            // top left
            -0.5, -0.5, 0.0,
            // bottom left
            -0.5, 0.5,  0.0,
            // bottom right
            0.5,  0.5,  0.0,
            // top right
            0.5,  -0.5, 0.0,
        };
        const vertex_buffer = try Buffer.new(
            vapp,
            vk.VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT,
            vk.VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
            @sizeOf(@TypeOf(vertices)),
        );
        try vertex_buffer.memory.update(vapp, f32, &vertices);

        const indices = [_]u32{ 0, 1, 2, 0, 2, 3 };
        const index_buffer = try Buffer.new(
            vapp,
            vk.VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT,
            vk.VK_BUFFER_USAGE_INDEX_BUFFER_BIT,
            @sizeOf(@TypeOf(indices)),
        );
        try index_buffer.memory.update(vapp, u32, &indices);

        return .{
            .vertex_buffer = vertex_buffer,
            .index_buffer = index_buffer,
            .indices_count = indices.len,
        };
    }

    fn destroy(self: @This(), vapp: VulkanApp) void {
        self.vertex_buffer.destroy(vapp);
        self.index_buffer.destroy(vapp);
    }
};

pub const VulkanApp = struct {
    // core
    instance: vk.VkInstance = null,
    physical_device: vk.VkPhysicalDevice = null,
    physical_device_memory_properties: vk.VkPhysicalDeviceMemoryProperties = undefined,
    queue_family_index: u32 = 0,
    device: vk.VkDevice = null,
    queue: vk.VkQueue = null,
    command_pool: vk.VkCommandPool = null,

    // presentation
    surface: vk.VkSurfaceKHR = null,
    swapchain: vk.VkSwapchainKHR = null,
    swapchain_image_views: []vk.VkImageView = undefined,
    /// 描画開始待機用のセマフォ
    semaphore_image_enabled: vk.VkSemaphore = null,
    /// 描画完了待機用のセマフォ
    semaphore_rendering: vk.VkSemaphore = null,

    // rendering
    render_pass: vk.VkRenderPass = null,
    framebuffers: []vk.VkFramebuffer = undefined,

    // pipelines
    ui_pipeline: ui.UiPipeline = undefined,

    // other
    // NOTE: 正方形モデル。
    //       単純な2Dゲームなので正方形モデルしか扱わない。
    model: Model = undefined,

    pub fn new(wapp: windows.WindowApp) (Error || ui.Error)!VulkanApp {
        var vapp = VulkanApp{};

        try createInstance(&vapp);
        try getPhysicalDevice(&vapp);
        vk.vkGetPhysicalDeviceMemoryProperties(vapp.physical_device, &vapp.physical_device_memory_properties);
        try getFamilyIndex(&vapp);
        try createDevice(&vapp);
        vk.vkGetDeviceQueue(vapp.device, vapp.queue_family_index, 0, &vapp.queue);
        try createCommandPool(&vapp);

        try createSurface(&vapp, wapp);
        try createSwapchain(&vapp);
        try createSwapchainImageView(&vapp);
        try createSemaphores(&vapp);

        try createRenderPass(&vapp);
        try createFramebuffers(&vapp);

        vapp.ui_pipeline = try ui.UiPipeline.new(vapp);

        vapp.model = try Model.new(vapp);

        return vapp;
    }

    pub fn destroy(self: @This()) void {
        _ = vk.vkDeviceWaitIdle(self.device);

        self.model.destroy(self);

        self.ui_pipeline.destroy(self);

        for (self.framebuffers) |n| {
            vk.vkDestroyFramebuffer(self.device, n, null);
        }
        ALLOCATOR.free(self.framebuffers);
        vk.vkDestroyRenderPass(self.device, self.render_pass, null);

        vk.vkDestroySemaphore(self.device, self.semaphore_rendering, null);
        vk.vkDestroySemaphore(self.device, self.semaphore_image_enabled, null);
        for (self.swapchain_image_views) |n| {
            vk.vkDestroyImageView(self.device, n, null);
        }
        ALLOCATOR.free(self.swapchain_image_views);
        vk.vkDestroySwapchainKHR(self.device, self.swapchain, null);
        vk.vkDestroySurfaceKHR(self.instance, self.surface, null);

        vk.vkDestroyCommandPool(self.device, self.command_pool, null);
        vk.vkDestroyDevice(self.device, null);
        vk.vkDestroyInstance(self.instance, null);
    }

    pub fn render(self: @This()) Error!void {
        // NOTE: 次のスワップチェーンイメージのインデックスを取得する。
        //       vkAquireNextImageKHRを実行して取得しないと警告が出る。
        //       ここでsemaphore_image_enabledがシグナルされる。
        var image_index: u32 = 0;
        _ = vk.vkAcquireNextImageKHR(self.device, self.swapchain, std.math.maxInt(u64), self.semaphore_image_enabled, null, &image_index);

        const command_buffer = try self.allocateAndStartCommandBuffer();

        const bi = vk.VkRenderPassBeginInfo{
            .sType = vk.VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO,
            .pNext = null,
            .renderPass = self.render_pass,
            .framebuffer = self.framebuffers[image_index],
            .renderArea = .{
                .offset = .{ .x = 0, .y = 0 },
                .extent = .{ .width = gc.WIDTH, .height = gc.HEIGHT },
            },
            .clearValueCount = 1,
            .pClearValues = &.{ .color = .{ .float32 = .{ 0.1, 0.1, 0.1, 1.0 } } },
        };
        vk.vkCmdBeginRenderPass(command_buffer, &bi, vk.VK_SUBPASS_CONTENTS_INLINE);

        // UI
        vk.vkCmdBindPipeline(command_buffer, vk.VK_PIPELINE_BIND_POINT_GRAPHICS, self.ui_pipeline.pipeline);
        const offset: vk.VkDeviceSize = 0;
        vk.vkCmdBindVertexBuffers(command_buffer, 0, 1, &self.model.vertex_buffer.buffer, &offset);
        vk.vkCmdBindIndexBuffer(command_buffer, self.model.index_buffer.buffer, offset, vk.VK_INDEX_TYPE_UINT32);
        // TODO: データをバインドしてインスタンシングで描画する。
        vk.vkCmdDrawIndexed(command_buffer, self.model.indices_count, 1, 0, 0, 0);

        vk.vkCmdEndRenderPass(command_buffer);

        if (vk.vkEndCommandBuffer(command_buffer) != vk.VK_SUCCESS) {
            return error.CommandBufferEnding;
        }

        // NOTE: コマンドバッファを提出する。
        //       semaphore_image_enabledがシグナルされるまで待機する・つまりすぐ実行される。
        //       コマンドが完遂されたときsemaphore_renderingがシグナルされる。
        const sis = vk.VkSubmitInfo{
            .sType = vk.VK_STRUCTURE_TYPE_SUBMIT_INFO,
            .pNext = null,
            .waitSemaphoreCount = 1,
            .pWaitSemaphores = &self.semaphore_image_enabled,
            .pWaitDstStageMask = &@intCast(vk.VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT),
            .commandBufferCount = 1,
            .pCommandBuffers = &command_buffer,
            .signalSemaphoreCount = 1,
            .pSignalSemaphores = &self.semaphore_rendering,
        };
        if (vk.vkQueueSubmit(self.queue, 1, &sis, null) != vk.VK_SUCCESS) {
            return error.Submittion;
        }

        // NOTE: プレゼンテーションコマンドをエンキューする
        //       semaphore_renderingがシグナルされるまで・つまりコマンドが完遂されるまで待機する。
        var results = vk.VK_SUCCESS;
        const pi = vk.VkPresentInfoKHR{
            .sType = vk.VK_STRUCTURE_TYPE_PRESENT_INFO_KHR,
            .pNext = null,
            .waitSemaphoreCount = 1,
            .pWaitSemaphores = &self.semaphore_rendering,
            .swapchainCount = 1,
            .pSwapchains = &self.swapchain,
            .pImageIndices = &image_index,
            .pResults = &results,
        };
        if (vk.vkQueuePresentKHR(self.queue, &pi) != vk.VK_SUCCESS) {
            return error.Presentation;
        }
        if (results != vk.VK_SUCCESS) {
            return error.Presentation;
        }
    }

    fn allocateAndStartCommandBuffer(self: @This()) Error!vk.VkCommandBuffer {
        const ai = vk.VkCommandBufferAllocateInfo{
            .sType = vk.VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO,
            .pNext = null,
            .commandPool = self.command_pool,
            .level = vk.VK_COMMAND_BUFFER_LEVEL_PRIMARY,
            .commandBufferCount = 1,
        };
        var command_buffer: vk.VkCommandBuffer = null;
        if (vk.vkAllocateCommandBuffers(self.device, &ai, &command_buffer) != vk.VK_SUCCESS) {
            return error.CommandBufferCreation;
        }

        const bi = vk.VkCommandBufferBeginInfo{
            .sType = vk.VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO,
            .pNext = null,
            .flags = vk.VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT,
            .pInheritanceInfo = null,
        };
        if (vk.vkBeginCommandBuffer(command_buffer, &bi) != vk.VK_SUCCESS) {
            return error.CommandBufferStarting;
        }

        return command_buffer;
    }
};

fn createInstance(vapp: *VulkanApp) Error!void {
    const ai = vk.VkApplicationInfo{
        .sType = vk.VK_STRUCTURE_TYPE_APPLICATION_INFO,
        .pNext = null,
        .pApplicationName = "VulkanApplication",
        .applicationVersion = 0,
        .pEngineName = "VulkanApplication",
        .engineVersion = vk.VK_MAKE_VERSION(1, 0, 0),
        .apiVersion = vk.VK_API_VERSION_1_2,
    };
    const ci = vk.VkInstanceCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .pApplicationInfo = &ai,
        .enabledLayerCount = INSTANCE_ENABLED_LAYER_COUNT,
        .ppEnabledLayerNames = &INSTANCE_ENABLED_LAYER_NAMES,
        .enabledExtensionCount = INSTANCE_ENABLED_EXTENSION_COUNT,
        .ppEnabledExtensionNames = &INSTANCE_ENABLED_EXTENSION_NAMES,
    };
    if (vk.vkCreateInstance(&ci, null, &vapp.instance) != vk.VK_SUCCESS) {
        return error.InstanceCreation;
    }
}

fn getPhysicalDevice(vapp: *VulkanApp) Error!void {
    var count: u32 = 0;
    if (vk.vkEnumeratePhysicalDevices(vapp.instance, &count, null) != vk.VK_SUCCESS) {
        return error.PhysicalDeviceAcquisition;
    }
    const physical_devices = ALLOCATOR.alloc(vk.VkPhysicalDevice, count) catch {
        return error.PhysicalDeviceAcquisition;
    };
    defer ALLOCATOR.free(physical_devices);
    if (vk.vkEnumeratePhysicalDevices(vapp.instance, &count, physical_devices.ptr) != vk.VK_SUCCESS) {
        return error.PhysicalDeviceAcquisition;
    }
    // NOTE: 本来は適切な物理デバイスを選択すべきだが億劫なので最初のものを使う。
    vapp.physical_device = physical_devices[0];
}

fn getFamilyIndex(vapp: *VulkanApp) Error!void {
    var count: u32 = 0;
    vk.vkGetPhysicalDeviceQueueFamilyProperties(vapp.physical_device, &count, null);
    const properties = ALLOCATOR.alloc(vk.VkQueueFamilyProperties, count) catch {
        return error.PhysicalDeviceAcquisition;
    };
    defer ALLOCATOR.free(properties);
    vk.vkGetPhysicalDeviceQueueFamilyProperties(vapp.physical_device, &count, properties.ptr);
    for (properties, 0..) |n, i| {
        if ((n.queueFlags & vk.VK_QUEUE_GRAPHICS_BIT) > 0) {
            vapp.queue_family_index = @intCast(i);
            return;
        }
    }
    return error.QueueFamilyAcquisition;
}

fn createDevice(vapp: *VulkanApp) Error!void {
    const ci = vk.VkDeviceCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .queueCreateInfoCount = 1,
        .pQueueCreateInfos = &.{
            .sType = vk.VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .queueFamilyIndex = vapp.queue_family_index,
            .queueCount = 1,
            .pQueuePriorities = &[_]f32{1.0},
        },
        .enabledLayerCount = DEVICE_ENABLED_LAYER_COUNT,
        .ppEnabledLayerNames = &DEVICE_ENABLED_LAYER_NAMES,
        .enabledExtensionCount = DEVICE_ENABLED_EXTENSION_COUNT,
        .ppEnabledExtensionNames = &DEVICE_ENABLED_EXTENSION_NAMES,
        .pEnabledFeatures = null,
    };
    if (vk.vkCreateDevice(vapp.physical_device, &ci, null, &vapp.device) != vk.VK_SUCCESS) {
        return error.DeviceCreation;
    }
}

fn createCommandPool(vapp: *VulkanApp) Error!void {
    const ci = vk.VkCommandPoolCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO,
        .pNext = null,
        .flags = vk.VK_COMMAND_POOL_CREATE_TRANSIENT_BIT,
        .queueFamilyIndex = vapp.queue_family_index,
    };
    if (vk.vkCreateCommandPool(vapp.device, &ci, null, &vapp.command_pool) != vk.VK_SUCCESS) {
        return error.CommandPoolCreation;
    }
}

fn createSurface(vapp: *VulkanApp, wapp: windows.WindowApp) Error!void {
    const ci = vk.VkWin32SurfaceCreateInfoKHR{
        .sType = vk.VK_STRUCTURE_TYPE_WIN32_SURFACE_CREATE_INFO_KHR,
        .pNext = null,
        .flags = 0,
        .hinstance = @ptrCast(wapp.instance),
        .hwnd = @ptrCast(wapp.window),
    };
    if (vk.vkCreateWin32SurfaceKHR(vapp.instance, &ci, null, &vapp.surface) != vk.VK_SUCCESS) {
        return error.SurfaceCreation;
    }

    // サーフェスフォーマットが適切であるか確認
    var count: u32 = 0;
    if (vk.vkGetPhysicalDeviceSurfaceFormatsKHR(vapp.physical_device, vapp.surface, &count, null) != vk.VK_SUCCESS) {
        return error.InvalidSurface;
    }
    const formats = ALLOCATOR.alloc(vk.VkSurfaceFormatKHR, count) catch {
        return error.InvalidSurface;
    };
    defer ALLOCATOR.free(formats);
    if (vk.vkGetPhysicalDeviceSurfaceFormatsKHR(vapp.physical_device, vapp.surface, &count, formats.ptr) != vk.VK_SUCCESS) {
        return error.InvalidSurface;
    }
    var found = false;
    for (formats) |n| {
        if (n.format == RENDER_TARGET_PIXEL_FORMAT and n.colorSpace == RENDER_TARGET_COLOR_SPACE) {
            found = true;
            break;
        }
    }
    if (!found) {
        return error.InvalidSurface;
    }

    // サーフェスサイズが適切であるか確認
    var capabilities: vk.VkSurfaceCapabilitiesKHR = undefined;
    if (vk.vkGetPhysicalDeviceSurfaceCapabilitiesKHR(vapp.physical_device, vapp.surface, &capabilities) != vk.VK_SUCCESS) {
        return error.SurfaceCreation;
    }
    if (capabilities.currentExtent.width != gc.WIDTH or capabilities.currentExtent.height != gc.HEIGHT) {
        return error.InvalidSurface;
    }

    // 最少イメージ数が適切であるか確認
    // TODO: 3枚以上にも対応した方が良いのは間違いない。
    if (capabilities.minImageCount > SWAPCHAIN_IMAGE_COUNT) {
        return error.InvalidSurface;
    }
}

fn createSwapchain(vapp: *VulkanApp) Error!void {
    const ci = vk.VkSwapchainCreateInfoKHR{
        .sType = vk.VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR,
        .pNext = null,
        .flags = 0,
        .surface = vapp.surface,
        .minImageCount = SWAPCHAIN_IMAGE_COUNT,
        .imageFormat = RENDER_TARGET_PIXEL_FORMAT,
        .imageColorSpace = RENDER_TARGET_COLOR_SPACE,
        .imageExtent = .{ .width = gc.WIDTH, .height = gc.HEIGHT },
        .imageArrayLayers = 1,
        .imageUsage = vk.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
        .imageSharingMode = vk.VK_SHARING_MODE_EXCLUSIVE,
        .queueFamilyIndexCount = 0,
        .pQueueFamilyIndices = null,
        .preTransform = vk.VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR,
        .compositeAlpha = vk.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
        .presentMode = vk.VK_PRESENT_MODE_FIFO_KHR,
        .clipped = vk.VK_TRUE,
        .oldSwapchain = null,
    };
    if (vk.vkCreateSwapchainKHR(vapp.device, &ci, null, &vapp.swapchain) != vk.VK_SUCCESS) {
        return error.SwapchainCreation;
    }
}

fn createSwapchainImageView(vapp: *VulkanApp) Error!void {
    const images = ALLOCATOR.alloc(vk.VkImage, SWAPCHAIN_IMAGE_COUNT) catch {
        return error.SwapchainImageViewCreation;
    };
    defer ALLOCATOR.free(images);
    // TODO: 必要なので定義している。
    //       何らかの不都合があったときに値が変わる？
    var count: u32 = SWAPCHAIN_IMAGE_COUNT;
    if (vk.vkGetSwapchainImagesKHR(vapp.device, vapp.swapchain, &count, images.ptr) != vk.VK_SUCCESS) {
        return error.SwapchainImageViewCreation;
    }
    vapp.swapchain_image_views = ALLOCATOR.alloc(vk.VkImageView, images.len) catch {
        return error.SwapchainImageViewCreation;
    };
    for (images, 0..) |n, i| {
        const ci = vk.VkImageViewCreateInfo{
            .sType = vk.VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .image = n,
            .viewType = vk.VK_IMAGE_VIEW_TYPE_2D,
            .format = RENDER_TARGET_PIXEL_FORMAT,
            .components = .{ .r = 0, .g = 0, .b = 0, .a = 0 },
            .subresourceRange = .{
                .aspectMask = vk.VK_IMAGE_ASPECT_COLOR_BIT,
                .baseMipLevel = 0,
                .levelCount = 1,
                .baseArrayLayer = 0,
                .layerCount = 1,
            },
        };
        if (vk.vkCreateImageView(vapp.device, &ci, null, &vapp.swapchain_image_views[i]) != vk.VK_SUCCESS) {
            return error.SwapchainImageViewCreation;
        }
    }
}

fn createSemaphores(vapp: *VulkanApp) Error!void {
    const ci = vk.VkSemaphoreCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO,
        .pNext = null,
        .flags = 0,
    };
    if (vk.vkCreateSemaphore(vapp.device, &ci, null, &vapp.semaphore_image_enabled) != vk.VK_SUCCESS) {
        return error.SemaphoreCreation;
    }
    if (vk.vkCreateSemaphore(vapp.device, &ci, null, &vapp.semaphore_rendering) != vk.VK_SUCCESS) {
        return error.SemaphoreCreation;
    }
}

fn createRenderPass(vapp: *VulkanApp) Error!void {
    const attachment_descs = [_]vk.VkAttachmentDescription{
        // 0
        // undefinedからスワップチェーンイメージへ
        .{
            .flags = 0,
            .format = RENDER_TARGET_PIXEL_FORMAT,
            .samples = vk.VK_SAMPLE_COUNT_1_BIT,
            .loadOp = vk.VK_ATTACHMENT_LOAD_OP_CLEAR,
            .storeOp = vk.VK_ATTACHMENT_STORE_OP_STORE,
            .stencilLoadOp = vk.VK_ATTACHMENT_LOAD_OP_DONT_CARE,
            .stencilStoreOp = vk.VK_ATTACHMENT_STORE_OP_DONT_CARE,
            .initialLayout = vk.VK_IMAGE_LAYOUT_UNDEFINED,
            .finalLayout = vk.VK_IMAGE_LAYOUT_PRESENT_SRC_KHR,
        },
    };
    const subpass_descs = [_]vk.VkSubpassDescription{
        // 入力なし
        // 0へ出力
        .{
            .flags = 0,
            .pipelineBindPoint = vk.VK_PIPELINE_BIND_POINT_GRAPHICS,
            .inputAttachmentCount = 0,
            .pInputAttachments = null,
            .colorAttachmentCount = 1,
            .pColorAttachments = &.{
                .attachment = 0,
                .layout = vk.VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL,
            },
            .pResolveAttachments = null,
            .pDepthStencilAttachment = null,
            .preserveAttachmentCount = 0,
            .pPreserveAttachments = null,
        },
    };
    const ci = vk.VkRenderPassCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .attachmentCount = attachment_descs.len,
        .pAttachments = &attachment_descs,
        .subpassCount = subpass_descs.len,
        .pSubpasses = &subpass_descs,
        .dependencyCount = 0,
        .pDependencies = null,
    };
    if (vk.vkCreateRenderPass(vapp.device, &ci, null, &vapp.render_pass) != vk.VK_SUCCESS) {
        return error.RenderPassCreation;
    }
}

fn createFramebuffers(vapp: *VulkanApp) Error!void {
    vapp.framebuffers = ALLOCATOR.alloc(vk.VkFramebuffer, SWAPCHAIN_IMAGE_COUNT) catch {
        return error.FramebuffersCreation;
    };
    for (vapp.swapchain_image_views, 0..) |n, i| {
        const ci = vk.VkFramebufferCreateInfo{
            .sType = vk.VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .renderPass = vapp.render_pass,
            .attachmentCount = 1,
            .pAttachments = &n,
            .width = gc.WIDTH,
            .height = gc.HEIGHT,
            .layers = 1,
        };
        if (vk.vkCreateFramebuffer(vapp.device, &ci, null, &vapp.framebuffers[i]) != vk.VK_SUCCESS) {
            return error.FramebuffersCreation;
        }
    }
}
