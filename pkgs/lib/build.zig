const std = @import("std");
const LazyPath = std.Build.LazyPath;

pub fn build(b: *std.Build) void {
    // Vulkanの各種パスを環境変数から取得
    const vk_include_path = std.process.getEnvVarOwned(std.heap.page_allocator, "VK_INCLUDE_PATH") catch {
        @panic("VK_INCLUDE_PATH is not defined.");
    };
    const vk_library_path = std.process.getEnvVarOwned(std.heap.page_allocator, "VK_LIBRARY_PATH") catch {
        @panic("VK_LIBRARY_PATH is not defined.");
    };

    // シェーダ埋込み用モジュール
    const shader_module = b.createModule(.{
        .root_source_file = b.path("shader/shader.zig"),
    });

    // 本体のビルド設定
    const dll = b.addSharedLibrary(.{
        .name = "abplib",
        .root_source_file = b.path("src/lib.zig"),
        .target = b.standardTargetOptions(.{}),
        .optimize = b.standardOptimizeOption(.{}),
        .link_libc = true,
    });
    dll.addIncludePath(LazyPath{ .cwd_relative = vk_include_path });
    dll.addLibraryPath(LazyPath{ .cwd_relative = vk_library_path });
    dll.linkSystemLibrary("vulkan-1");
    dll.root_module.addImport("shader", shader_module);

    // 本体のビルド
    b.installArtifact(dll);
}
