import {Vec3} from "./vec3.js"
import {World} from "./world.js"
import {AABB} from "./aabb.js"
import {BlockType} from "./blocktype.js"
import * as Graphics from "./graphics.js"

export class Entity {
    constructor(x, y, z, width, height, physics_enabled){
        this.previous_position = new Vec3(x, y, z);
        this.current_position = new Vec3(x, y, z);
        this.interpolated_position = new Vec3(x, y, z);
        this.velocity = new Vec3(0,0,0);
        this.width = width;
        this.height = height;
        this.half_extents = new Vec3(width/2,height/2,width/2);
        this.physics_enabled = physics_enabled;
    }

    move(v){
        this.velocity.x += (v.x - this.velocity.x) * 0.2;
        if (!this.physics_enabled) this.velocity.y += (v.y - this.velocity.y) * 0.2;
        this.velocity.z += (v.z - this.velocity.z) * 0.2;
    }

    tick(){

        this.previous_position.copy(this.current_position);        

        if (this.physics_enabled){
            this.velocity.y -= 0.04;

            var d = this.velocity.clone();

            while (!d.is_zero()){
            
                var aabb = new AABB(
                    this.previous_position.clone().sub(this.half_extents),
                    this.previous_position.clone().add(this.half_extents)
                );

                aabb.expand(d);
                aabb.min.floor();
                aabb.max.floor();

                for (var y = aabb.min.y; y <= aabb.max.y; y++){
                    for (var z = aabb.min.z; z <= aabb.max.z; z++){
                        for (var x = aabb.min.x; x <= aabb.max.x; x++){
                            var block_id = World.get_block_id(new Vec3(x,y,z));
                            if (block_id == 0) continue;
                            var type = BlockType.get(block_id);
                            type.collide(this, d);
                        }
                    }
                }
            }

            this.current_position.add(this.velocity); //remove
        } else {
            this.current_position.add(this.velocity);
        }
    }

    interpolate(t){
        this.interpolated_position.copy(this.previous_position);
        this.interpolated_position.lerp(this.current_position,t);
    }

    draw_wireframe(){
        Graphics.use_color();
        Graphics.push();
        Graphics.translate(
            this.interpolated_position.x - this.width/2,
            this.interpolated_position.y - this.height/2,
            this.interpolated_position.z - this.width/2
        );
        Graphics.color(0,255,0,255);
        Graphics.begin_lines();
            Graphics.position(0,0,0);
            Graphics.position(this.width,0,0);
            Graphics.position(0,this.height,0);
            Graphics.position(this.width,this.height,0);

            Graphics.position(0,0,this.width);
            Graphics.position(this.width,0,this.width);
            Graphics.position(0,this.height,this.width);
            Graphics.position(this.width,this.height,this.width);

            Graphics.position(0,0,0);
            Graphics.position(0,0,this.width);
            Graphics.position(this.width,0,0);
            Graphics.position(this.width,0,this.width);

            Graphics.position(0,this.height,0);
            Graphics.position(0,this.height,this.width);
            Graphics.position(this.width,this.height,0);
            Graphics.position(this.width,this.height,this.width);

            Graphics.position(0,0,0);
            Graphics.position(0,this.height,0);
            Graphics.position(this.width,0,0);
            Graphics.position(this.width,this.height,0);

            Graphics.position(0,0,this.width);
            Graphics.position(0,this.height,this.width);
            Graphics.position(this.width,0,this.width);
            Graphics.position(this.width,this.height,this.width);
        Graphics.end();
        Graphics.pop();
    }
}