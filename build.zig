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

    // シェーダのコンパイル
    const shader_compile = b.addSystemCommand(&.{"py"});
    shader_compile.addArgs(&.{"util/compile-shader/main.py"});

    // シェーダ埋込み用モジュール
    const shader_module = b.createModule(.{
        .root_source_file = b.path("src/shader/shader.zig"),
    });

    // 本体のビルド設定
    const exe = b.addExecutable(.{
        .name = "abp",
        .root_source_file = b.path("src/exe/main.zig"),
        .target = b.standardTargetOptions(.{}),
        .optimize = b.standardOptimizeOption(.{}),
        .link_libc = true,
    });
    exe.addIncludePath(LazyPath{ .cwd_relative = vk_include_path });
    exe.addLibraryPath(LazyPath{ .cwd_relative = vk_library_path });
    exe.linkSystemLibrary("vulkan-1");
    exe.step.dependOn(&shader_compile.step);
    exe.root_module.addImport("shader", shader_module);

    // 本体のビルド
    b.installArtifact(exe);

    // zig build runの設定
    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);
}
