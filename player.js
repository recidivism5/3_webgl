import {Entity} from "./entity.js"
import {Vec3} from "./vec3.js"
import * as Input from "./input.js"
import {Raycast} from "./raycast.js"
import * as Graphics from "./graphics.js"

export class Player extends Entity {

    constructor (x, y, z){
        super(x, y, z, 0.6, 1.8, true);
        this.head_rotation_x = 0;
        this.head_rotation_y = 0;
        this.raycast = null;
    }

    rotate_head(x, y){
        this.head_rotation_x += x;
        if (this.head_rotation_x > 89.99){
            this.head_rotation_x = 89.99;
        } else if (this.head_rotation_x < -89.99){
            this.head_rotation_x = -89.99;
        }
        this.head_rotation_y += y;
    }

    get_head_y(){
        return this.interpolated_position.y + 0.72;
    }

    use_camera(){
        Graphics.project_perspective(90,Graphics.canvas.width/Graphics.canvas.height,0.01,100.0);

        Graphics.load_identity();
        Graphics.rotate_x(-this.head_rotation_x);
        Graphics.rotate_y(-this.head_rotation_y);
        Graphics.translate(
            -this.interpolated_position.x,
            -this.get_head_y(),
            -this.interpolated_position.z,
        );
    }

    get_head_direction(){
        var direction = new Vec3(0,0,-1);
        direction.rotate_x(this.head_rotation_x);
        direction.rotate_y(this.head_rotation_y);
        return direction;
    }

    tick(){
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
            if (!this.physics_enabled){
                move.rotate_x(this.head_rotation_x);
            }
            move.rotate_y(this.head_rotation_y);
        }
        this.move(move);
        if (Input.jump && this.on_ground){
            this.on_ground = false;
            this.velocity.y = 0.45;
        }
        super.tick();
    }

    update_raycast(){
        var direction = this.get_head_direction().scale(5);
        var head_pos = new Vec3(
            this.interpolated_position.x,
            this.get_head_y(),
            this.interpolated_position.z
        );
        this.raycast = Raycast.cubes(head_pos, direction);
    }

    is_targeting_block(x, y, z){
        if (this.raycast == null) return false;
        return this.raycast.position.equal(new Vec3(x,y,z));
    }
}