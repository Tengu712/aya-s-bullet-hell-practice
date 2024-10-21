const std = @import("std");
const windows = @import("window/windows.zig");
const vulkan = @import("renderer/vulkan.zig");

const Instance = struct {
    wapp: windows.WindowApp,
    vapp: vulkan.VulkanApp,

    fn new() !Instance {
        const wapp = try windows.WindowApp.new();
        const vapp = try vulkan.VulkanApp.new(wapp);
        return .{
            .wapp = wapp,
            .vapp = vapp,
        };
    }

    fn destroy(self: @This()) void {
        self.vapp.destroy();
        self.wapp.destroy();
    }
};

var instance: ?Instance = null;

export fn start() bool {
    instance = Instance.new() catch {
        std.log.err("failed to create instance.", .{});
        return false;
    };
    return true;
}

export fn end() void {
    if (instance == null) {
        std.log.warn("instance not active.", .{});
        return;
    }

    instance.?.destroy();
    instance = null;
}

export fn update() bool {
    if (instance == null) {
        std.log.warn("instance not active.", .{});
        return true;
    }

    if (!instance.?.wapp.do_events()) {
        return false;
    }
    instance.?.vapp.render() catch {
        std.log.warn("failed to render.", .{});
    };
    return true;
}
