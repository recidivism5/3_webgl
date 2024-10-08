import {World} from "./world.js"
import {BlockType} from "./blocktype.js"
import * as Graphics from "./graphics.js"
import {Palette} from "./palette.js"
import {Vec3} from "./vec3.js"
import {Player} from "./player.js"
import { Block } from "./block.js"

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
        this.lights = new Uint8Array(Chunk.width*Chunk.width*Chunk.height);
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
                this.set_block(x, 0, z, 1, 6, 15);
            }
        }
    }

    update_lights(){

    }

    update_neighbors(){
        this.neighbors[0] = World.get_chunk(this.x-1,this.z);
        this.neighbors[1] = World.get_chunk(this.x+1,this.z);
        this.neighbors[4] = World.get_chunk(this.x,this.z-1);
        this.neighbors[5] = World.get_chunk(this.x,this.z+1);
    }

    draw_block(x, y, z, type, color){
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
                    World.get_block_offset(neighbor_pos.get_component(component))
                );
                var neighbor_chunk = this.neighbors[index];
                if (neighbor_chunk == undefined) return;
                neighbor_id = neighbor_chunk.get_block_id(
                    neighbor_pos.x,
                    neighbor_pos.y,
                    neighbor_pos.z
                );
            }
            type.draw_clipped_face(x, y, z, index, neighbor_id, color);
        });
        type.draw_non_border_faces(x, y, z, color);
    }

    draw(){
        Graphics.push();
        Graphics.translate(this.x * Chunk.width, 0, this.z * Chunk.width);
        
        Graphics.begin_tris();
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
        Graphics.end();

        Graphics.pop();
    }

    get_block_offset(x, y, z){
        return y*Chunk.width*Chunk.width + z*Chunk.width + x;
    }

    get_block_id(x, y, z){
        if (y < 0 || y >= Chunk.height) return 0;
        if (
            x < 0 || x >= Chunk.width ||
            z < 0 || z >= Chunk.width
        ){
            return -1;
        }
        return this.blocks[this.get_block_offset(x,y,z)*2 + 0];
    }

    set_block_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return;
        }
        this.blocks[this.get_block_offset(x,y,z)*2 + 0] = val;
    }

    get_block_color_id(x, y, z){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return -1;
        }
        return this.blocks[this.get_block_offset(x,y,z)*2 + 1];
    }

    set_block_color_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return;
        }
        this.blocks[this.get_block_offset(x,y,z)*2 + 1] = val;
    }

    get_block(x, y, z){
        if (y < 0 || y >= Chunk.height) return 0;
        if (
            x < 0 || x >= Chunk.width ||
            z < 0 || z >= Chunk.width
        ){
            return -1;
        }
        var offset = this.get_block_offset(x,y,z);
        return new Block(
            this.blocks[offset*2 + 0],
            this.blocks[offset*2 + 1],
            this.lights[offset]
        );
    }

    set_block(x, y, z, id, color_id, light){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return;
        }
        var offset = this.get_block_offset(x,y,z);
        this.blocks[offset*2 + 0] = id;
        this.blocks[offset*2 + 1] = color_id;
        this.lights[offset] = light;
    }
}