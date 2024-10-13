const std = @import("std");
const windows = @import("window/windows.zig");
const vulkan = @import("renderer/vulkan.zig");

pub fn main() !void {
    const wapp = try windows.WindowApp.new();
    defer wapp.destroy();

    const vapp = try vulkan.VulkanApp.new(wapp);
    defer vapp.destroy();

    var count: u32 = 0;
    while (true) {
        if (!wapp.do_events()) {
            break;
        }
        vapp.render() catch {
            std.log.warn("failed to render.", .{});
        };

        count += 1;
        if (count % 60 == 0) {
            std.log.debug("{}", .{count / 60});
        }
    }
}
