use super::*;

use sstar::log::*;

pub enum AbpKeycode {
    Left,
    Right,
    Up,
    Down,
    Z,
    X,
    Shift,
    Escape,
}

// TODO: support for axis.
const STR_JSC: [(&'static str, Keycode); 13] = [
    ("a", Keycode::JsButtonA),
    ("b", Keycode::JsButtonB),
    ("x", Keycode::JsButtonX),
    ("y", Keycode::JsButtonY),
    ("left", Keycode::JsButtonLeft),
    ("right", Keycode::JsButtonRight),
    ("up", Keycode::JsButtonUp),
    ("down", Keycode::JsButtonDown),
    ("left-shoulder", Keycode::JsButtonLShoulder),
    ("right-shoulder", Keycode::JsButtonRShoulder),
    ("left-thumb", Keycode::JsButtonLThumb),
    ("right-thumb", Keycode::JsButtonRThumb),
    ("start", Keycode::JsButtonStart),
];

pub(super) fn configure(settings: &HashMap<String, String>) -> HashMap<Keycode, Keycode> {
    let str_jsc = HashMap::from(STR_JSC);
    let mut js_map = HashMap::new();
    let mut inner = |k: &'static str, kc: Keycode| {
        let v = settings
            .get(k)
            .unwrap_or_else(|| ss_error(&format!("'{k}' not found in settings.cfg.")));
        let jsc = str_jsc
            .get(v.as_str())
            .unwrap_or_else(|| ss_error(&format!("invalid key '{v}' found in settings.cfg.")));
        js_map.insert(kc, jsc.clone());
    };
    inner("left", Keycode::Left);
    inner("right", Keycode::Right);
    inner("up", Keycode::Up);
    inner("down", Keycode::Down);
    inner("z", Keycode::KeyZ);
    inner("x", Keycode::KeyX);
    inner("shift", Keycode::Shift);
    inner("escape", Keycode::Escape);
    js_map
}

impl System {
    pub fn get_input(&self, kc: AbpKeycode) -> u32 {
        match kc {
            AbpKeycode::Left => self.get_input_inner(Keycode::Left),
            AbpKeycode::Right => self.get_input_inner(Keycode::Right),
            AbpKeycode::Up => self.get_input_inner(Keycode::Up),
            AbpKeycode::Down => self.get_input_inner(Keycode::Down),
            AbpKeycode::Z => self.get_input_inner(Keycode::KeyZ),
            AbpKeycode::X => self.get_input_inner(Keycode::KeyX),
            AbpKeycode::Shift => self.get_input_inner(Keycode::Shift),
            AbpKeycode::Escape => self.get_input_inner(Keycode::Escape),
        }
    }

    fn get_input_inner(&self, kc: Keycode) -> u32 {
        let kb = self.window_app.get_input(kc.clone());
        let js = self.window_app.get_input(self.js_map[&kc].clone());
        std::cmp::max(kb, js)
    }
}
