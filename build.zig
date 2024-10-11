const std = @import("std");
const LazyPath = std.Build.LazyPath;

pub fn build(b: *std.Build) void {
    const vk_include_path = std.process.getEnvVarOwned(std.heap.page_allocator, "VK_INCLUDE_PATH") catch {
        @panic("VK_INCLUDE_PATH is not defined.");
    };
    const vk_library_path = std.process.getEnvVarOwned(std.heap.page_allocator, "VK_LIBRARY_PATH") catch {
        @panic("VK_LIBRARY_PATH is not defined.");
    };

    const exe = b.addExecutable(.{
        .name = "abp",
        .root_source_file = b.path("src/main.zig"),
        .target = b.standardTargetOptions(.{}),
        .optimize = b.standardOptimizeOption(.{}),
        .link_libc = true,
    });
    exe.addIncludePath(LazyPath{ .cwd_relative = vk_include_path });
    exe.addLibraryPath(LazyPath{ .cwd_relative = vk_library_path });
    exe.linkSystemLibrary("vulkan-1");
    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);
}
