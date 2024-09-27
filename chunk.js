import {World} from "./world.js"
import {BlockType} from "./blocktype.js"
import {Immediate} from "./immediate.js"
import {Mat4Stack} from "./mat4stack.js"
import {Vec3} from "./vec3.js"
import {Color} from "./color.js"
import * as random from "./random.js"

export class ChunkPos {
    constructor(x,z){
        this.x = x;
        this.z = z;
    }

    static bpos_to_cpos_component(c){
        return (c < 0 ? -1 : 0) + Math.trunc(c / Chunk.width);
    }

    static from_block_pos(pos){
        return new ChunkPos(
            ChunkPos.bpos_to_cpos_component(pos.x),
            ChunkPos.bpos_to_cpos_component(pos.z)
        );
    }

    to_string(){
        return "x: " + this.x + "\nz: " + this.z;
    }

    equal(p){
        return this.x === p.x && this.z === p.z;
    }

    get_block_origin(){
        return new Vec3(
            this.x * Chunk.width,
            0,
            this.z * Chunk.width
        );
    }
}

export class Chunk {

    static width = 16;
    static height = 16;

    constructor(position){
        this.position = position;
        this.blocks = new Uint8Array(Chunk.width*Chunk.width*Chunk.height);
        for (var z = 0; z < Chunk.width; z++){
            for (var x = 0; x < Chunk.width; x++){
                this.set_block_id(new Vec3(x,0,z), 1);
                if (x%2){
                    this.set_block_id(new Vec3(x,1,z), random.rand_int(BlockType.types.length));
                }
            }
        }
    }

    draw_block(offset, type){
        BlockType.iterate_borders((index, plane)=>{
            var neighbor_offset = offset.clone().add(plane.normal);
            var id = this.get_block_id(neighbor_offset);
            type.draw_clipped_face(offset, index, id);
        });
        type.draw_non_border_faces(offset);
    }

    draw(){
        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.push();
        Mat4Stack.translate(this.position.get_block_origin());
        Mat4Stack.upload();
        Immediate.begin();
        var offset = new Vec3(0,0,0);
        for (offset.y = 0; offset.y < Chunk.height; offset.y++){
            for (offset.z = 0; offset.z < Chunk.width; offset.z++){
                for (offset.x = 0; offset.x < Chunk.width; offset.x++){
                    var id = this.get_block_id(offset);
                    if (!id) continue;
                    this.draw_block(offset, BlockType.get(id));
                }
            }
        }
        Immediate.end();
        Mat4Stack.pop();
    }

    get_block_id(offset){
        if (offset.y < 0 || offset.y >= Chunk.height) return 0;
        if (
            offset.x < 0 || offset.x >= Chunk.width ||
            offset.z < 0 || offset.z >= Chunk.width
        ){
            if (offset.x >= Chunk.width && offset.z > 0){
                Math.floor(0);
            }
            return World.get_block_id(this.position.get_block_origin().add(offset));
        }
        return this.blocks[offset.y*Chunk.width*Chunk.width + offset.z*Chunk.width + offset.x];
    }

    set_block_id(offset, val){
        if (
            offset.x < 0 || offset.x >= Chunk.width ||
            offset.y < 0 || offset.y >= Chunk.height ||
            offset.z < 0 || offset.z >= Chunk.width
        ){
            return false;
        }
        this.blocks[offset.y*Chunk.width*Chunk.width + offset.z*Chunk.width + offset.x] = val;
        return true;
    }
}