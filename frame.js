import {Tick} from "./tick.js"
import {World} from "./world.js"
import {Player} from "./player.js"
import {Mat4Stack} from "./mat4stack.js";
import {Immediate} from "./immediate.js";

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

        gl.clearColor(1.0,1.0,1.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(wireframeshader);

        Player.update_raycast();

        Player.use_camera();

        World.draw();

        Mat4Stack.mode(Mat4Stack.PROJECTION);
        Mat4Stack.load_identity();
        Mat4Stack.ortho(0,canvas.width,0,canvas.height,-1,1);
        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.load_identity();
        Mat4Stack.upload();
        gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ONE_MINUS_SRC_COLOR);
        gl.disable(gl.DEPTH_TEST);
        Immediate.begin();
        Immediate.set_type(0);
        const radius = 2;
        const thickness = 2;
        const big_radius = radius + thickness;
        const n_vertices = 16;
        const d = 2*Math.PI / n_vertices;
        const center_x = canvas.width/2;
        const center_y = canvas.height/2;
        for (var i = 0; i < n_vertices; i++){
            var angle0 = i * d;
            var angle1 = (i + 1) * d;
            var x0 = Math.cos(angle0);
            var x1 = Math.cos(angle1);
            var y0 = Math.sin(angle0);
            var y1 = Math.sin(angle1);
            
            Immediate.vertex(center_x + big_radius * x1, center_y + big_radius * y1, 0, 255, 255, 255, 127, 0, 0, 0, 0);
            Immediate.vertex(center_x + radius * x1, center_y + radius * y1, 0, 255, 255, 255, 127, 0, 0, 0, 0);
            Immediate.vertex(center_x + radius * x0, center_y + radius * y0, 0, 255, 255, 255, 127, 0, 0, 0, 0);

            Immediate.vertex(center_x + radius * x0, center_y + radius * y0, 0, 255, 255, 255, 127, 0, 0, 0, 0);
            Immediate.vertex(center_x + big_radius * x0, center_y + big_radius * y0, 0, 255, 255, 255, 127, 0, 0, 0, 0);
            Immediate.vertex(center_x + big_radius * x1, center_y + big_radius * y1, 0, 255, 255, 255, 127, 0, 0, 0, 0);
        }
        Immediate.end();
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        requestAnimationFrame(Frame.do);
    }
}