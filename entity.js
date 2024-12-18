import {Vec3} from "./vec3.js"
import * as Terrain from "./terrain.js"
import {AABB} from "./aabb.js"
import * as BlockType from "./blocktype.js"
import * as Graphics from "./graphics.js"
import { Plane } from "./plane.js"
import {entities} from "./main.js"
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

var colliders_map = new Map();

function get_colliders(half_extents){
    var key = half_extents.x.toString() + "," +
              half_extents.y.toString() + "," + 
              half_extents.z.toString();
    var colliders = colliders_map.get(key);
    if (colliders == undefined){
        colliders = [];
        for (var i = 0; i < BlockType.types.length; i++){
            colliders.push(new Collider(half_extents, i));
        }
        colliders_map.set(key, colliders);
    }
    return colliders;
}

export class Entity {
    constructor(x, y, z, width, height, physics_enabled){
        this.width = width;
        this.height = height;
        this.half_extents = new Vec3(width/2,height/2,width/2);
        this.previous_position = new Vec3(x, y, z);
        this.current_position = new Vec3(x, y, z);
        this.interpolated_position = new Vec3(x, y, z);
        this.current_aabb = new AABB();
        this.update_aabb();
        this.velocity = new Vec3(0, 0, 0);
        this.physics_enabled = physics_enabled;
        this.on_ground = false;
        this.colliders = get_colliders(this.half_extents);
    }

    update_aabb(){
        this.current_aabb.min.copy(this.current_position);
        this.current_aabb.min.sub(this.half_extents);
        this.current_aabb.max.copy(this.current_position);
        this.current_aabb.max.add(this.half_extents);
    }
    
    move(v){
        this.current_position.add(v);
        this.update_aabb();
    }

    accelerate(v){
        this.velocity.x += (v.x - this.velocity.x) * 0.2;
        if (!this.physics_enabled) this.velocity.y += (v.y - this.velocity.y) * 0.2;
        this.velocity.z += (v.z - this.velocity.z) * 0.2;
    }

    tick(){

        this.on_ground = false;

        this.previous_position.copy(this.current_position);        

        if (!this.physics_enabled){
            this.move(this.velocity);
            return;
        }

        this.velocity.y -= 0.06;

        var ray = this.velocity.clone();

        var r0 = new Vec3();
        var r1 = new Vec3();
        var r3 = new Vec3();

        var a = new Vec3();
        var b = new Vec3();

        var aabb = new AABB();

        while (!ray.is_zero()){

            aabb.copy(this.current_aabb);

            aabb.expand(ray);
            aabb.min.floor();
            aabb.max.floor();
            
            /*aabb.min.x--;
            aabb.min.y--;
            aabb.min.z--;
            aabb.max.x++;
            aabb.max.y++;
            aabb.max.z++;*/

            var t = 1.0;
            var hit_normal = null;

            for (var y = aabb.min.y; y <= aabb.max.y; y++){
                for (var z = aabb.min.z; z <= aabb.max.z; z++){
                    for (var x = aabb.min.x; x <= aabb.max.x; x++){
                        var block_id = Terrain.get_block_id(x,y,z);
                        if (block_id <= 0 || block_id >= BlockType.types.length) continue;
                        var collider = this.colliders[block_id];
                        r0.copy(this.current_position);
                        r0.subc(x, y, z);
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
                                hit_normal = plane.normal;
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
                const nudge = 0.00001;
                for (var y = aabb.min.y; y <= aabb.max.y; y++){
                    for (var z = aabb.min.z; z <= aabb.max.z; z++){
                        for (var x = aabb.min.x; x <= aabb.max.x; x++){
                            var block_id = Terrain.get_block_id(x,y,z);
                            if (block_id <= 0 || block_id >= BlockType.types.length) continue;
                            var collider = this.colliders[block_id];
                            r0.copy(this.current_position);
                            r0.subc(x, y, z);
                            for (var i = 0; i < collider.type.expanded_faces.length; i++){
                                var face = collider.type.expanded_faces[i];
                                var plane = collider.planes[i];
                                var d0 = plane.distance_to(r0);
                                if (d0 < -nudge) continue;
                                if (d0 > nudge) continue;
                                var on = true;
                                for (var j = 0; j < face.length; j++){
                                    var k = (j + 1) % face.length;
                                    var p0 = collider.positions[face[j]];
                                    var p1 = collider.positions[face[k]];
                                    a.copy(p1);
                                    a.sub(p0);
                                    b.copy(r0);
                                    b.sub(p0);
                                    a.cross(b);
                                    if (a.dot(plane.normal) < 0){
                                        on = false;
                                        break;
                                    }
                                }
                                if (on && plane.normal.dot(hit_normal) < 0){
                                    //angle with hitplane is acute (normals are obtuse to eachother)
                                    r1.copy(plane.normal);
                                    r1.sub(hit_normal);
                                    r1.scale(0.5);
                                    r1.add(hit_normal);
                                    r1.normalize();
                                    r1.scale(4 * nudge);
                                    this.move(r1);
                                    x = aabb.max.x + 1; //break out of block iteration
                                    y = aabb.max.y + 1;
                                    z = aabb.max.z + 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                r3.copy(hit_normal);
                r3.scale(nudge);
                this.move(r3);
                ray.scale(1 - t);
                ray.project_onto_plane(hit_normal);
                this.velocity.project_onto_plane(hit_normal);
                if (hit_normal.dot(Vec3.UP) >= 0.5){
                    this.on_ground = true;
                }
            } else {
                this.move(ray);
                ray.set_zero();
            }
        }

        for (var i = 0; i < entities.length; i++){
            var entity = entities[i];
            if (entity == this) continue;
            if (this.current_aabb.overlaps(entity.current_aabb)){
                var a = this.current_aabb;
                var b = entity.current_aabb;
                var distances = [
                    b.min.x - a.max.x,
                    b.max.x - a.min.x,
                    b.min.y - a.max.y,
                    b.max.y - a.min.y,
                    b.min.z - a.max.z,
                    b.max.z - a.min.z,
                ];
                var index;
                var min = Infinity;
                for (var j = 0; j < 6; j++){
                    var abs = Math.abs(distances[j]);
                    if (abs < min){
                        index = j;
                        min = abs;
                    }
                }
                var component = Math.floor(index / 2);
                const rigidity = 1.0;
                var d = rigidity * distances[index] / 2;
                this.velocity.add_component(component, d);
                entity.velocity.add_component(component, -d);
            }
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