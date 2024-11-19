import {Entity} from "./entity.js"
import * as Graphics from "./graphics.js"
import { Vec3 } from "./vec3.js"

export class Head extends Entity{
    constructor(x, y, z){
        super(x, y, z, 37/32, 85 / 32, true);
    }

    tick(){
        this.accelerate(Vec3.ZERO);
        super.tick();
    }

    draw(now){
        Graphics.use_direct();
        Graphics.submit_lights();
        Graphics.bind_texture("head.png");
        Graphics.color(255,255,255,255);
        Graphics.push();
            Graphics.translate(
                this.interpolated_position.x,
                this.interpolated_position.y,
                this.interpolated_position.z
            );
            Graphics.rotate_y(now*16);
            Graphics.scale(1/32,1/32,1/32);
            Graphics.translate(-37/2,-85/2,-37/2);
            Graphics.box(37,85,37,0,0);
        Graphics.pop();
    }
}