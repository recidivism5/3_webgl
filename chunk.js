import {World} from "./world.js"
import {BlockType} from "./blocktype.js"
import {Immediate} from "./immediate.js"
import {Mat4Stack} from "./mat4stack.js"
import {Palette} from "./palette.js"
import {Vec3} from "./vec3.js"
import {Player} from "./player.js"

export class Chunk {

    static width = 16;
    static height = 16;

    static get_key(x, z){
        return "x: " + x + "\nz: " + z;
    }

    constructor(x, z){
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(Chunk.width*Chunk.width*Chunk.height*2);
        this.generate();
        this.neighbors = [];
        this.update_neighbors();
    }

    get_key(){
        return Chunk.get_key(this.x, this.z);
    }

    generate(){
        for (var z = 0; z < Chunk.width; z++){
            for (var x = 0; x < Chunk.width; x++){
                this.set_block_id(x, 0, z, 1);
                this.set_block_color_id(x, 0, z, Palette.get_random_id());
                if (x%2){
                    this.set_block_id(x, 1, z, BlockType.get_random_id());
                    this.set_block_color_id(x, 1, z, Palette.get_random_id());
                }
            }
        }
    }

    update_neighbors(){
        this.neighbors[0] = World.get_chunk(this.x-1,this.z);
        this.neighbors[1] = World.get_chunk(this.x+1,this.z);
        this.neighbors[4] = World.get_chunk(this.x,this.z-1);
        this.neighbors[5] = World.get_chunk(this.x,this.z+1);
    }

    draw_block(x, y, z, type, color){
        var enable_outline = Player.is_targeting_block(
            this.x * Chunk.width + x,
            y,
            this.z * Chunk.width + z
        );
        BlockType.iterate_borders((component, direction, index, plane)=>{
            var neighbor_pos = new Vec3(x, y, z);
            neighbor_pos.set_component(
                component,
                neighbor_pos.get_component(component) + direction
            );
            var neighbor_id = this.get_block_id(
                neighbor_pos.x,
                neighbor_pos.y,
                neighbor_pos.z
            );
            if (neighbor_id == -1){
                neighbor_pos.set_component(
                    component,
                    World.to_chunk_local(neighbor_pos.get_component(component))
                );
                var neighbor_chunk = this.neighbors[index];
                if (neighbor_chunk == undefined) return;
                neighbor_id = neighbor_chunk.get_block_id(
                    neighbor_pos.x,
                    neighbor_pos.y,
                    neighbor_pos.z
                );
            }
            type.draw_clipped_face(x, y, z, index, neighbor_id, color, enable_outline);
        });
        type.draw_non_border_faces(x, y, z, color, enable_outline);
    }

    draw(){
        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.push();
        Mat4Stack.translate(this.x * Chunk.width, 0, this.z * Chunk.width);
        Mat4Stack.upload();
        Immediate.begin();
        this.update_neighbors();
        for (var y = 0; y < Chunk.height; y++){
            for (var z = 0; z < Chunk.width; z++){
                for (var x = 0; x < Chunk.width; x++){
                    var id = this.get_block_id(x, y, z);
                    if (id == 0) continue;
                    var color_id = this.get_block_color_id(x, y, z);
                    var color = Palette.get(color_id);
                    this.draw_block(x, y, z, BlockType.get(id), color);
                }
            }
        }
        Immediate.end();
        Mat4Stack.pop();
    }

    get_block_id(x, y, z){
        if (y < 0 || y >= Chunk.height) return 0;
        if (
            x < 0 || x >= Chunk.width ||
            z < 0 || z >= Chunk.width
        ){
            return -1;
        }
        return this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 0];
    }

    set_block_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return;
        }
        this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 0] = val;
    }

    get_block_color_id(x, y, z){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return -1;
        }
        return this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 1];
    }

    set_block_color_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return;
        }
        this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 1] = val;
    }
}