import { WebGL2App } from "./webgl2";

function main() {
    const webgl2_app = new WebGL2App();
    const fps_label = document.getElementById("fps-label") as HTMLLabelElement;

    // TODO: add event listener to reset texts when resizing.

    let cnt = 0;
    let prev = performance.now();

    function loop() {
        const start = performance.now();

        // calculate fps
        cnt += 1;
        const duration = start - prev;
        if (duration > 1000.0) {
            const fps = (cnt * 1000.0) / duration;
            cnt = 0;
            prev = start;
            fps_label.innerText = fps.toFixed(1) + "fps";
        }

        // TODO: update game.
        webgl2_app.draw();

        // go to next loop
        const end = performance.now();
        const ms = Math.max(16.6666666666666 - (end - start), 0.0);
        setTimeout(loop, ms);
    }

    loop();
}

main();
