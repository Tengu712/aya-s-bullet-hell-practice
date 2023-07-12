import { WebGL2App } from './webgl2';
import { loadResources } from './resource';
import { Scene } from './scene';
import { TitleScene } from './scene/title';

const DIV_60MSPF = 60.0 / 1000.0;
const KEYS = new Set<string>();
KEYS.add('arrowup');
KEYS.add('arrowdown');
KEYS.add('arrowleft');
KEYS.add('arrowright');
KEYS.add('shift');
KEYS.add('escape');
KEYS.add('z');
KEYS.add('x');

export type GameApp = {
    readonly wapp: WebGL2App,
    readonly istates: Map<string, number>,
    pft: number,
};

async function main() {
    const app: GameApp = {
        wapp: new WebGL2App(),
        pft: 0,
        istates: new Map<string, number>(),
    };

    // load scene
    await loadResources(app.wapp);

    let cnt = 0;
    let start = 0;
    let prev = 0;
    let wait_cnt = 0;
    let scene: Scene = new TitleScene();

    const wrapper = document.getElementById('wrapper') as HTMLDivElement;
    const fps_label = document.getElementById('fps-label') as HTMLLabelElement;
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
        fps_label.style.fontSize = (30.0 * h / 960.0) + 'px';
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

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (!KEYS.has(key))
            return;
        if (!app.istates.has(key))
            app.istates.set(key, 0);
        event.preventDefault();
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (!KEYS.has(key))
            return;
        app.istates.delete(key);
        event.preventDefault();
    });

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
        app.pft = (time_stamp - prev) * DIV_60MSPF;
        prev = time_stamp;

        // update input states
        for (const [k, v] of app.istates) {
            app.istates.set(k, v + 1);
        }

        // update
        app.wapp.clear();
        const next = scene.update(app);
        if (next !== null)
            scene = next;
        app.wapp.flush();

        // go to next loop
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

main();
