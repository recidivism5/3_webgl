import {Mat4Stack} from "./mat4stack.js";
import {Immediate} from "./immediate.js";

export class Crosshair {
    static draw(){
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
    }
}