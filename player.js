import {Humanoid} from "./humanoid.js"
import {Vec3} from "./vec3.js"
import {Input} from "./input.js"

export class Player {

    static humanoid = new Humanoid(new Vec3(16,16,16));

    static tick(){
        var move = new Vec3(0,0,0);
        if (Input.left ^ Input.right){
            move.x = Input.left ? -1 : 1;
        }
        if (Input.forward ^ Input.backward){
            move.z = Input.forward ? -1 : 1;
        }
        if (!move.is_zero()){
            move.normalize();
            move.scale(1);
            if (!this.humanoid.entity.physics_enabled){
                move.rotate_x(this.humanoid.head_rotation_x);
            }
            move.rotate_y(this.humanoid.head_rotation_y);
        }
        this.humanoid.move(move);
        this.humanoid.tick();
    }

    static interpolate(t){
        this.humanoid.interpolate(t);
    }

    static use_camera(){
        this.humanoid.use_camera();
    }
}