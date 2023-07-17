import { WebGL2App } from './webgl2';
import { loadResources } from './resource';
import { Scene } from './scene';
import { TitleScene } from './scene/title';
import { TextBuilder, TextManager } from './manager/tmanager';
import { InputManager } from './manager/imanager';

const DIV_60MSPF = 60.0 / 1000.0;

export type GameApp = {
    // core
    readonly wapp: WebGL2App,
    readonly im: InputManager,
    readonly tm: TextManager,

    // system
    debug_mode: boolean,
    framerate_adaptation: boolean,
    pft: number,
};

async function main() {
    // create app
    const app: GameApp = {
        wapp: new WebGL2App(),
        im: new InputManager(),
        tm: new TextManager(),
        debug_mode: false,
        framerate_adaptation: true,
        pft: 0,
    };

    // load scene
    await loadResources(app.wapp);

    // fps
    let cnt = 0;
    let start = 0;
    let prev = 0;
    let wait_cnt = 0;
    const fps_label = new TextBuilder('00.0fps').size(30).rb(0, 0).build();
    app.tm.add(fps_label);

    const wrapper = document.getElementById('wrapper') as HTMLDivElement;
    function resize_callback(again: boolean) {
        // canvas
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w * 3 / 4 < h) {
            h = w * 3 / 4;
            wrapper.style.width = w + 'px';
            wrapper.style.height = h + 'px';
        } else {
            w = h * 4 / 3;
            wrapper.style.width = w + 'px';
            wrapper.style.height = h + 'px';
        }
        // labels
        app.tm.resize(h / 960.0);
        // NOTE: to deal with fullscreen change, call self after a certain time.
        if (again)
            setTimeout(resize_callback, 300, false);
    }
    new ResizeObserver(() => resize_callback(true)).observe(document.body);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // TODO: resume audio.
        } else {
            // TODO: pause audio.
            wait_cnt = 10;
        }
    });

    let scene: Scene = new TitleScene();

    function loop(time_stamp: number) {
        // wait until fps is stable
        if (wait_cnt > 0) {
            wait_cnt -= 1;
            if (wait_cnt === 0) {
                const prev_frame_time = time_stamp - prev;
                start += prev_frame_time;
                prev = time_stamp;
            }
            requestAnimationFrame(loop);
            return;
        }

        // calculate fps
        cnt += 1;
        const duration = time_stamp - start;
        if (duration > 1000.0) {
            const fps = (cnt * 1000.0) / duration;
            cnt = 0;
            start = time_stamp;
            fps_label.innerText = fps.toFixed(1) + 'fps';
        }

        // calculate previous frame time
        app.pft = app.framerate_adaptation ? (time_stamp - prev) * DIV_60MSPF : 1.0;
        prev = time_stamp;

        // update
        app.im.updateGamepad();
        app.wapp.clear();
        const next = scene.update(app);
        if (next !== null)
            scene = next;
        app.wapp.flush();
        app.im.increment();

        // go to next loop
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

main();
