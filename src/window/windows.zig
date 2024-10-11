const std = @import("std");
const win = @cImport(@cInclude("Windows.h"));
const gc = @import("../gc.zig");

const w = std.unicode.utf8ToUtf16LeStringLiteral;

const WC_NAME = w("SKD_WC");

pub const Error = error{
    NullInstance,
    WindowClassRegistration,
    NullWindow,
};

fn windowProcedure(
    window: win.HWND,
    msg: c_uint,
    wparam: win.WPARAM,
    lparam: win.LPARAM,
) callconv(.C) win.LRESULT {
    if (msg == win.WM_DESTROY) {
        win.PostQuitMessage(0);
        return 0;
    }
    return win.DefWindowProcW(window, msg, wparam, lparam);
}

pub const Window = struct {
    instance: win.HINSTANCE,
    window: win.HWND,

    pub fn new() Error!Window {
        const instance = win.GetModuleHandleW(null);
        if (instance == null) {
            return error.NullInstance;
        }

        const wc = win.WNDCLASSEXW{
            .cbSize = @sizeOf(win.WNDCLASSEXW),
            .style = win.CS_CLASSDC,
            .lpfnWndProc = windowProcedure,
            .cbClsExtra = 0,
            .cbWndExtra = 0,
            .hInstance = instance,
            .hIcon = null,
            .hCursor = null,
            .hbrBackground = null,
            .lpszMenuName = null,
            .lpszClassName = WC_NAME,
            .hIconSm = null,
        };
        if (win.RegisterClassExW(&wc) == 0) {
            return error.WindowClassRegistration;
        }

        const style = win.WS_OVERLAPPED | win.WS_CAPTION | win.WS_SYSMENU | win.WS_MINIMIZEBOX;
        var rect = win.RECT{
            .left = 0,
            .top = 0,
            .right = gc.WIDTH,
            .bottom = gc.HEIGHT,
        };
        _ = win.AdjustWindowRect(&rect, style, 0);

        const window = win.CreateWindowExW(
            0,
            WC_NAME,
            w("射命丸文の弾幕稽古"),
            style,
            0,
            0,
            rect.right - rect.left,
            rect.bottom - rect.top,
            null,
            null,
            instance,
            null,
        );
        if (window == null) {
            return error.NullWindow;
        }

        _ = win.ShowWindow(window, win.SW_SHOWDEFAULT);
        _ = win.UpdateWindow(window);

        return Window{
            .instance = instance,
            .window = window,
        };
    }

    pub fn destroy(self: @This()) void {
        _ = win.DestroyWindow(self.window);
        _ = win.UnregisterClassW(WC_NAME, self.instance);
    }

    /// ウィンドウイベントをすべて処理するメソッド。
    ///
    /// ウィンドウが破棄された場合falseを返す。
    pub fn do_events(_: @This()) bool {
        var msg = win.MSG{};
        while (win.PeekMessageW(&msg, null, 0, 0, win.PM_REMOVE) != 0) {
            if (msg.message == win.WM_QUIT) {
                return false;
            }
            _ = win.TranslateMessage(&msg);
            _ = win.DispatchMessageW(&msg);
        }
        return true;
    }
};
