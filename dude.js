import {Entity} from "./entity.js"
import * as Graphics from "./graphics.js"

export class Dude extends Entity{
    constructor(x, y, z){
        super(x, y, z, 8/16, (9+9+8) / 16, true);
    }

    draw(now){
        Graphics.use_direct();
        Graphics.submit_lights();
        Graphics.bind_texture("dude.png");
        Graphics.color(255,255,255,255);
        Graphics.push();
            Graphics.translate(
                this.interpolated_position.x,
                this.interpolated_position.y,
                this.interpolated_position.z
            );
            Graphics.rotate_y(now*16);
            Graphics.scale(1/16,1/16,1/16);
            Graphics.translate(-2,-4.5,-2);
            Graphics.begin_tris();
            Graphics.box(4,9,4,0,3);
            Graphics.end();
            Graphics.push();
                Graphics.translate(-2,9,-2);
                Graphics.begin_tris();
                Graphics.box(8,8,8,0,16);
                Graphics.end();
            Graphics.pop();
            Graphics.push();
                Graphics.translate(-1.99,9,2);
                Graphics.rotate_x(Math.sin(-now*2) * 80);
                Graphics.translate(0,-9,-1);
                Graphics.begin_tris();
                Graphics.box(2,9,2,16,5);
                Graphics.end();
            Graphics.pop();
            Graphics.push();
                Graphics.translate(3.99,9,2);
                Graphics.rotate_x(Math.sin(now*2) * 80);
                Graphics.translate(0,-9,-1);
                Graphics.begin_tris();
                Graphics.box(2,9,2,16,5);
                Graphics.end();
            Graphics.pop();
            Graphics.push();
                Graphics.translate(0.01,0,2);
                Graphics.rotate_x(Math.sin(now*2) * 80);
                Graphics.translate(0,-9,-1);
                Graphics.begin_tris();
                Graphics.box(2,9,2,24,5);
                Graphics.end();
            Graphics.pop();
            Graphics.push();
                Graphics.translate(1.99,0,2);
                Graphics.rotate_x(Math.sin(-now*2) * 80);
                Graphics.translate(0,-9,-1);
                Graphics.begin_tris();
                Graphics.box(2,9,2,24,5);
                Graphics.end();
            Graphics.pop();
        Graphics.pop();
    }
}