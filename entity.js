import {Vec3} from "./vec3.js"
import {World} from "./world.js"
import {AABB} from "./aabb.js"
import {BlockType} from "./blocktype.js"
import * as Graphics from "./graphics.js"
import { Plane } from "./plane.js"
import { EPSILON } from "./epsilon.js"

class Collider {
    constructor(half_extents, id){
        this.type = BlockType.types[id];
        this.positions = [];
        var offset = new Vec3(0,0,0);
        for (var i = 0; i < this.type.expanded_positions.length; i++){
            var ep = this.type.expanded_positions[i];
            var p = this.type.positions[ep.parent].clone();
            offset.copy(ep.offset);
            offset.mul(half_extents);
            p.add(offset);
            this.positions.push(p);
        }
        this.unique_edges = [];
        this.planes = [];
        this.type.expanded_faces.forEach((face)=>{
            var plane = Plane.from_triangle(
                this.positions[face[0]],
                this.positions[face[1]],
                this.positions[face[2]]
            );
            this.planes.push(plane);
            for (var i = 0; i < face.length; i++){
                var j = (i + 1) % face.length;
                var edgef = [face[i],face[j]];
                var edger = [face[j],face[i]];
                var found = false;
                for (var k = 0; k < this.unique_edges.length; k++){
                    var edge = this.unique_edges[k];
                    if (
                        (edge[0] == edgef[0] && edge[1] == edgef[1]) ||
                        (edge[0] == edger[0] && edge[1] == edger[1])
                    ){
                        found = true;
                        break;
                    }
                }
                if (found) continue;
                this.unique_edges.push(edgef);
            }
        });
    }

    draw_wireframe(x, y, z){
        Graphics.push();
            Graphics.translate(x, y, z);
            Graphics.begin_lines();
            Graphics.color(0,255,0,255);
            this.unique_edges.forEach((edge)=>{
                edge.forEach((pos_id)=>{
                    var pos = this.wire_positions[pos_id];
                    Graphics.position(
                        pos.x,
                        pos.y,
                        pos.z
                    );
                });
            });
            Graphics.end();
        Graphics.pop();
    }
}

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

        this.build_colliders();
    }

    build_colliders(){
        this.colliders = [];
        for (var i = 0; i < BlockType.types.length; i++){
            this.colliders.push(new Collider(this.half_extents, i));
        }
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

            var ray = this.velocity.clone();

            var r0 = new Vec3(0,0,0);
            var r1 = new Vec3(0,0,0);
            var r3 = new Vec3(0,0,0);

            var a = new Vec3(0,0,0);
            var b = new Vec3(0,0,0);

            while (!ray.is_zero()){
            
                var aabb = new AABB(
                    this.previous_position.clone().sub(this.half_extents),
                    this.previous_position.clone().add(this.half_extents)
                );

                aabb.expand(ray);
                aabb.min.floor();
                aabb.max.floor();

                var t = 1.0;
                var hit_plane = null;

                for (var y = aabb.min.y; y <= aabb.max.y; y++){
                    for (var z = aabb.min.z; z <= aabb.max.z; z++){
                        for (var x = aabb.min.x; x <= aabb.max.x; x++){
                            var block_id = World.get_block_id(x,y,z);
                            if (block_id <= 0 || block_id >= BlockType.types.length) continue;
                            var collider = this.colliders[block_id];
                            r0.set(-x, -y, -z);
                            r0.add(this.current_position);
                            r1.copy(r0);
                            r1.add(ray);
                            for (var i = 0; i < collider.type.expanded_faces.length; i++){
                                var face = collider.type.expanded_faces[i];
                                var plane = collider.planes[i];
                                if (ray.dot(plane.normal) > 0) continue;
                                var d0 = plane.distance_to(r0);
                                if (d0 < 0) continue;
                                var d1 = plane.distance_to(r1);
                                if (d1 > 0) continue;
                                var nt = d0 / (d0 + Math.abs(d1));
                                r3.copy(ray);
                                r3.scale(nt);
                                r3.add(r0);
                                var on = true;
                                for (var j = 0; j < face.length; j++){
                                    var k = (j + 1) % face.length;
                                    var p0 = collider.positions[face[j]];
                                    var p1 = collider.positions[face[k]];
                                    a.copy(p1);
                                    a.sub(p0);
                                    b.copy(r3);
                                    b.sub(p0);
                                    a.cross(b);
                                    if (a.dot(plane.normal) < 0){
                                        on = false;
                                        break;
                                    }
                                }
                                if (on && nt < t){
                                    t = nt;
                                    hit_plane = plane;
                                }
                            }
                        }
                    }
                }
                if (t < 0) break;
                if (t < 1){
                    r3.copy(ray);
                    r3.scale(t);
                    this.current_position.add(r3);
                    r3.copy(hit_plane.normal);
                    r3.scale(0.001);
                    this.current_position.add(r3);
                    ray.scale(1 - t);
                    ray.project_onto_plane(hit_plane.normal);
                    this.velocity.project_onto_plane(hit_plane.normal);
                } else {
                    this.current_position.add(ray);
                    ray.set_zero();
                }
            }
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