import {Vec3} from "./vec3.js"
import * as world from "./world.js"
import {AABB} from "./aabb.js"
import * as blocktypes from "./blocktype.js"

export class Entity {
    constructor(position, width, height, physics_enabled){
        this.previous_position = position.clone();
        this.current_position = position.clone();
        this.interpolated_position = position.clone();
        this.velocity = new Vec3(0,0,0);
        this.width = width;
        this.height = height;
        this.half_extents = new Vec3(width/2,height/2,width/2);
        this.physics_enabled = physics_enabled;
    }

    move(v){
        this.velocity.lerp(v,0.2);
    }

    tick(){

        this.previous_position.copy(this.current_position);        

        if (this.physics_enabled){
            this.velocity.y -= 0.04;

            var d = this.velocity.clone();
            
            var aabb = new AABB(
                this.previous_position.clone().sub(this.half_extents),
                this.previous_position.clone().add(this.half_extents)
            );

            var expanded_aabb = aabb.clone();
            expanded_aabb.expand(d);
            expanded_aabb.min.floor();
            expanded_aabb.max.floor();
        } else {
            this.current_position.add(this.velocity);
        }
    }

    interpolate(t){
        this.interpolated_position.copy(this.previous_position);
        this.interpolated_position.lerp(this.current_position,t);
    }
}