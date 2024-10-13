const std = @import("std");
const vulkan = @import("vulkan.zig");
const gc = @import("../gc.zig");
const vk = vulkan.vk;

const ALLOCATOR = std.heap.page_allocator;
const VERTEX_SHADER_FILE = @embedFile("../shader/ui.vert.spv");
const FRAGMENT_SHADER_FILE = @embedFile("../shader/ui.frag.spv");

pub const Error = error{
    DescriptorSetLayoutCreation,
    PipelineLayoutCreation,
    ShaderModuleCreation,
    PipelineCreation,
};

pub const UiPipeline = struct {
    descriptor_set_layout: vk.VkDescriptorSetLayout = null,
    pipeline_layout: vk.VkPipelineLayout = null,
    vertex_shader: vk.VkShaderModule = null,
    fragment_shader: vk.VkShaderModule = null,
    pipeline: vk.VkPipeline = null,

    pub fn new(vapp: vulkan.VulkanApp) Error!UiPipeline {
        var pipeline = UiPipeline{};

        try createDescriptorSetLayout(&pipeline, vapp);
        try createPipelineLayout(&pipeline, vapp);
        pipeline.vertex_shader = try createShaderModule(vapp, VERTEX_SHADER_FILE);
        pipeline.fragment_shader = try createShaderModule(vapp, FRAGMENT_SHADER_FILE);
        try createPipeline(&pipeline, vapp);

        return pipeline;
    }

    pub fn destroy(self: @This(), vapp: vulkan.VulkanApp) void {
        vk.vkDestroyPipeline(vapp.device, self.pipeline, null);
        vk.vkDestroyShaderModule(vapp.device, self.fragment_shader, null);
        vk.vkDestroyShaderModule(vapp.device, self.vertex_shader, null);
        vk.vkDestroyPipelineLayout(vapp.device, self.pipeline_layout, null);
        vk.vkDestroyDescriptorSetLayout(vapp.device, self.descriptor_set_layout, null);
    }
};

fn createDescriptorSetLayout(pipeline: *UiPipeline, vapp: vulkan.VulkanApp) Error!void {
    // NOTE: 将来的にバインドするために空配列を作っている。
    const bindings = [_]vk.VkDescriptorSetLayoutBinding{};
    const ci = vk.VkDescriptorSetLayoutCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_DESCRIPTOR_SET_LAYOUT_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .bindingCount = bindings.len,
        .pBindings = &bindings,
    };
    if (vk.vkCreateDescriptorSetLayout(vapp.device, &ci, null, &pipeline.descriptor_set_layout) != vk.VK_SUCCESS) {
        return error.DescriptorSetLayoutCreation;
    }
}

fn createPipelineLayout(pipeline: *UiPipeline, vapp: vulkan.VulkanApp) Error!void {
    const set_layouts = [_]vk.VkDescriptorSetLayout{pipeline.descriptor_set_layout};
    const ci = vk.VkPipelineLayoutCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .setLayoutCount = set_layouts.len,
        .pSetLayouts = &set_layouts,
        .pushConstantRangeCount = 0,
        .pPushConstantRanges = null,
    };
    if (vk.vkCreatePipelineLayout(vapp.device, &ci, null, &pipeline.pipeline_layout) != vk.VK_SUCCESS) {
        return error.PipelineLayoutCreation;
    }
}

fn createShaderModule(vapp: vulkan.VulkanApp, file: []const u8) Error!vk.VkShaderModule {
    // OPTIMIZE: file.ptrを[*]u32に変換することができなかったため、新しく[]u32を作成している。
    //           一時的なメモリとはいえ、なんだか気に食わないので直したい。
    //           ただ、zig的にどうあがいても解決できない可能性もある。
    const code = ALLOCATOR.alloc(u32, file.len / @sizeOf(u32)) catch {
        return error.ShaderModuleCreation;
    };
    defer ALLOCATOR.free(code);
    for (code, 0..) |*n, i| {
        const o = i * 4;
        const b = [_]u8{ file[o], file[o + 1], file[o + 2], file[o + 3] };
        n.* = std.mem.readInt(u32, &b, .little);
    }

    var shader_module: vk.VkShaderModule = null;
    const ci = vk.VkShaderModuleCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_SHADER_MODULE_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .codeSize = file.len,
        .pCode = code.ptr,
    };
    if (vk.vkCreateShaderModule(vapp.device, &ci, null, &shader_module) != vk.VK_SUCCESS) {
        return error.ShaderModuleCreation;
    }
    return shader_module;
}

fn createPipeline(pipeline: *UiPipeline, vapp: vulkan.VulkanApp) Error!void {
    const ci = vk.VkGraphicsPipelineCreateInfo{
        .sType = vk.VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO,
        .pNext = null,
        .flags = 0,
        .stageCount = 2,
        // シェーダ
        .pStages = &[_]vk.VkPipelineShaderStageCreateInfo{
            .{
                .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO,
                .pNext = null,
                .flags = 0,
                .stage = vk.VK_SHADER_STAGE_VERTEX_BIT,
                .module = pipeline.vertex_shader,
                .pName = "main",
                .pSpecializationInfo = null,
            },
            .{
                .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_SHADER_STAGE_CREATE_INFO,
                .pNext = null,
                .flags = 0,
                .stage = vk.VK_SHADER_STAGE_FRAGMENT_BIT,
                .module = pipeline.fragment_shader,
                .pName = "main",
                .pSpecializationInfo = null,
            },
        },
        // 頂点入力
        // - location 0, binding 0, float*3: ローカル座標
        .pVertexInputState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .vertexBindingDescriptionCount = 1,
            .pVertexBindingDescriptions = &.{
                .binding = 0,
                .stride = @sizeOf(f32) * 3,
                .inputRate = vk.VK_VERTEX_INPUT_RATE_VERTEX,
            },
            .vertexAttributeDescriptionCount = 1,
            .pVertexAttributeDescriptions = &[_]vk.VkVertexInputAttributeDescription{
                .{
                    .location = 0,
                    .binding = 0,
                    .format = vk.VK_FORMAT_R32G32B32_SFLOAT,
                    .offset = 0,
                },
            },
        },
        // アセンブリステート
        .pInputAssemblyState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .topology = vk.VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST,
            .primitiveRestartEnable = vk.VK_FALSE,
        },
        .pTessellationState = null,
        // ビューポート
        .pViewportState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .viewportCount = 1,
            .pViewports = &.{
                .x = 0.0,
                .y = 0.0,
                .width = @floatFromInt(gc.WIDTH),
                .height = @floatFromInt(gc.HEIGHT),
                .minDepth = 0.0,
                .maxDepth = 1.0,
            },
            .scissorCount = 1,
            .pScissors = &.{
                .offset = .{ .x = 0, .y = 0 },
                .extent = .{ .width = gc.WIDTH, .height = gc.HEIGHT },
            },
        },
        // ラスタライゼーション
        // - ポリゴン全埋め
        // - カリング無し
        // - 時計回り表
        .pRasterizationState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .depthClampEnable = vk.VK_FALSE,
            .rasterizerDiscardEnable = vk.VK_FALSE,
            .polygonMode = vk.VK_POLYGON_MODE_FILL,
            .cullMode = vk.VK_CULL_MODE_NONE,
            .frontFace = vk.VK_FRONT_FACE_COUNTER_CLOCKWISE,
            .depthBiasEnable = vk.VK_FALSE,
            .depthBiasConstantFactor = 0.0,
            .depthBiasClamp = 0.0,
            .depthBiasSlopeFactor = 0.0,
            .lineWidth = 1.0,
        },
        // マルチサンプル
        // NOTE: マルチサンプリングは行わないが、nullにすると怒られるので。
        .pMultisampleState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .rasterizationSamples = vk.VK_SAMPLE_COUNT_1_BIT,
            .sampleShadingEnable = vk.VK_FALSE,
            .minSampleShading = 0.0,
            .pSampleMask = null,
            .alphaToCoverageEnable = vk.VK_FALSE,
            .alphaToOneEnable = vk.VK_FALSE,
        },
        .pDepthStencilState = null,
        // カラーブレンド
        // - src: alpha
        // - dst: 1 - alpha
        .pColorBlendState = &.{
            .sType = vk.VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO,
            .pNext = null,
            .flags = 0,
            .logicOpEnable = vk.VK_FALSE,
            .logicOp = 0,
            .attachmentCount = 1,
            .pAttachments = &.{
                .blendEnable = vk.VK_TRUE,
                .srcColorBlendFactor = vk.VK_BLEND_FACTOR_SRC_ALPHA,
                .dstColorBlendFactor = vk.VK_BLEND_FACTOR_ONE_MINUS_SRC_ALPHA,
                .colorBlendOp = vk.VK_BLEND_OP_ADD,
                .srcAlphaBlendFactor = vk.VK_BLEND_FACTOR_SRC_ALPHA,
                .dstAlphaBlendFactor = vk.VK_BLEND_FACTOR_ONE_MINUS_SRC_ALPHA,
                .alphaBlendOp = vk.VK_BLEND_OP_ADD,
                .colorWriteMask = vk.VK_COLOR_COMPONENT_R_BIT | vk.VK_COLOR_COMPONENT_G_BIT | vk.VK_COLOR_COMPONENT_B_BIT | vk.VK_COLOR_COMPONENT_A_BIT,
            },
            .blendConstants = .{ 0.0, 0.0, 0.0, 0.0 },
        },
        .pDynamicState = null,
        .layout = pipeline.pipeline_layout,
        .renderPass = vapp.render_pass,
        .subpass = 0,
        .basePipelineHandle = null,
        .basePipelineIndex = 0,
    };
    if (vk.vkCreateGraphicsPipelines(vapp.device, null, 1, &ci, null, &pipeline.pipeline) != vk.VK_SUCCESS) {
        return error.PipelineCreation;
    }
}
