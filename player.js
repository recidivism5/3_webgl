import {Humanoid} from "./humanoid.js"
import {Vec3} from "./vec3.js"
import {Input} from "./input.js"
import {Raycast} from "./raycast.js"

export class Player {

    static humanoid;

    static raycast = null;

    static init(){
        Player.humanoid = new Humanoid(4,4,4);
    }

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
            move.scale(0.4);
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

    static update_raycast(){
        var direction = this.humanoid.get_head_direction().scale(5);
        Player.raycast = Raycast.cubes(this.humanoid.head_position, direction);
    }

    static is_targeting_block(x, y, z){
        if (Player.raycast == null) return false;
        return Player.raycast.position.equal(new Vec3(x,y,z));
    }
}