const std = @import("std");
const winutil = @import("window/windows.zig");

pub fn main() !void {
    const window = try winutil.Window.new();

    while (true) {
        if (!window.do_events()) {
            break;
        }
        std.log.debug("Hello, world!", .{});
        std.time.sleep(100000000);
    }

    window.destroy();
}
