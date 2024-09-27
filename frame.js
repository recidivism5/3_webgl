import {Tick} from "./tick.js"
import {World} from "./world.js"
import {Player} from "./player.js"

var before = -1.0;
var accumulated_time = 0.0;
const TICK_RATE = 20.0;
const SEC_PER_TICK = 1.0 / TICK_RATE;

export class Frame {
    static do(now){
        now *= 0.001; //convert to seconds
        if (before <= 0.0){
            before = now;
        }
        accumulated_time += now - before;
        before = now;
        while (accumulated_time >= SEC_PER_TICK){
            accumulated_time -= SEC_PER_TICK;
            Tick.do();
        }
        Tick.interpolate(accumulated_time / SEC_PER_TICK);

        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        gl.viewport(0,0,canvas.width,canvas.height);

        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(wireframeshader);

        Player.use_camera();

        World.draw();
        
        requestAnimationFrame(Frame.do);
    }
}