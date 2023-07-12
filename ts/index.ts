import { WebGL2App } from './webgl2';
import { loadResources } from './resource';

async function main() {
    const wapp = new WebGL2App();
    const fps_label = document.getElementById('fps-label') as HTMLLabelElement;

    // load scene
    await loadResources(wapp);

    let cnt = 0;
    let start = 0;
    let prev = 0;
    let wait_cnt = 0;
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // TODO: resume audio.
        } else {
            // TODO: pause audio.
            wait_cnt = 10;
        }
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
        const prev_frame_time = time_stamp - prev;
        prev = time_stamp;

        wapp.clear();
        // TODO: update game.
        wapp.draw({
            scl: [2048.0, 1024.0],
            rot: [0.0, 0.0, 0.0],
            trs: [0.0, 0.0, 0.0],
        }); // DEBUG
        wapp.flush();

        // go to next loop
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

main();
