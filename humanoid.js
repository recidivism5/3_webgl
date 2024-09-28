import {Entity} from "./entity.js"
import {Mat4Stack} from "./mat4stack.js"

export class Humanoid {
    constructor (position){
        this.entity = new Entity(position, 0.6, 1.8, false);
        this.head_position = position.clone();
        this.adjust_head_position();
        this.head_rotation_x = 0;
        this.head_rotation_y = 0;
    }

    adjust_head_position(){
        this.head_position.y += 1.62 - 0.9;
    }

    move(v){
        this.entity.move(v);
    }

    tick(){
        this.entity.tick();
    }

    interpolate(t){
        this.entity.interpolate(t);
        this.head_position.copy(this.entity.interpolated_position);
        this.adjust_head_position();
    }

    use_camera(){
        Mat4Stack.mode(Mat4Stack.PROJECTION);
        Mat4Stack.load_identity();
        Mat4Stack.perspective(90,canvas.width/canvas.height,0.01,100.0);

        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.load_identity();
        Mat4Stack.rotate_x(-this.head_rotation_x);
        Mat4Stack.rotate_y(-this.head_rotation_y);
        Mat4Stack.translate(
            -this.head_position.x,
            -this.head_position.y,
            -this.head_position.z,
        );
    }
}