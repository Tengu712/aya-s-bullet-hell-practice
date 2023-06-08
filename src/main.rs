mod resource;
mod scene;
mod system;

use system::System;

fn main() {
    System::new().run();
}
