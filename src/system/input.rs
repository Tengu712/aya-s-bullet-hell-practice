use super::*;

pub enum AbpKeycode {
    Left,
    Right,
    Up,
    Down,
}

impl System {
    pub fn get_input(&self, kc: AbpKeycode) -> u32 {
        match kc {
            AbpKeycode::Left => self.get_input_inner(Keycode::Left),
            AbpKeycode::Right => self.get_input_inner(Keycode::Right),
            AbpKeycode::Up => self.get_input_inner(Keycode::Up),
            AbpKeycode::Down => self.get_input_inner(Keycode::Down),
        }
    }

    fn get_input_inner(&self, kc: Keycode) -> u32 {
        let kb = self.window_app.get_input(kc.clone());
        let js = self.window_app.get_input(self.js_map[&kc].clone());
        std::cmp::max(kb, js)
    }
}
