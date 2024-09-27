import {World} from "./world.js"
import {BlockType} from "./blocktype.js"
import {Immediate} from "./immediate.js"
import {Mat4Stack} from "./mat4stack.js"
import {Vec3} from "./vec3.js"
import {Color} from "./color.js"
import * as random from "./random.js"

var cga_colors = [
	new Color(0x00,0x00,0x00,0xFF),
	new Color(0x00,0x00,0xAA,0xFF),
	new Color(0x00,0xAA,0x00,0xFF),
	new Color(0x00,0xAA,0xAA,0xFF),
	new Color(0xAA,0x00,0x00,0xFF),
	new Color(0xAA,0x00,0xAA,0xFF),
	new Color(0xAA,0x55,0x00,0xFF),
	new Color(0xAA,0xAA,0xAA,0xFF),
	new Color(0x55,0x55,0x55,0xFF),
	new Color(0x55,0x55,0xFF,0xFF),
	new Color(0x55,0xFF,0x55,0xFF),
	new Color(0x55,0xFF,0xFF,0xFF),
	new Color(0xFF,0x55,0x55,0xFF),
	new Color(0xFF,0x55,0xFF,0xFF),
	new Color(0xFF,0xFF,0x55,0xFF),
	new Color(0xFF,0xFF,0xFF,0xFF),
];

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
        this.blocks = new Uint8Array(Chunk.width*Chunk.width*Chunk.height*2);
        for (var z = 1; z < Chunk.width-1; z++){
            for (var x = 1; x < Chunk.width-1; x++){
                this.set_block_id(x, 0, z, 1);
                this.set_block_color_id(x, 0, z, random.rand_int(cga_colors.length));
                if (x%2){
                    this.set_block_id(x, 1, z, random.rand_int(BlockType.types.length));
                    this.set_block_color_id(x, 1, z, random.rand_int(cga_colors.length));
                }
            }
        }
    }

    draw_block(x, y, z, type, color){
        BlockType.iterate_borders((index, plane)=>{
            var id = this.get_block_id(x + plane.normal.x, y + plane.normal.y, z + plane.normal.z);
            type.draw_clipped_face(x, y, z, index, id, color);
        });
        type.draw_non_border_faces(x, y, z, color);
    }

    draw(){
        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.push();
        Mat4Stack.translate(this.position.get_block_origin());
        Mat4Stack.upload();
        Immediate.begin();
        for (var y = 0; y < Chunk.height; y++){
            for (var z = 0; z < Chunk.width; z++){
                for (var x = 0; x < Chunk.width; x++){
                    var id = this.get_block_id(x, y, z);
                    if (!id) continue;
                    var color = cga_colors[this.get_block_color_id(x,y,z)];
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
            //return World.get_block_id(this.position.get_block_origin().add(offset));
        }
        return this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 0];
    }

    set_block_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return false;
        }
        this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 0] = val;
        return true;
    }

    get_block_color_id(x, y, z){
        if (y < 0 || y >= Chunk.height) return 0;
        if (
            x < 0 || x >= Chunk.width ||
            z < 0 || z >= Chunk.width
        ){
            if (x >= Chunk.width && z > 0){
                Math.floor(0);
            }
            //return World.get_block_id(this.position.get_block_origin().add(offset)); fuck you
        }
        return this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 1];
    }

    set_block_color_id(x, y, z, val){
        if (
            x < 0 || x >= Chunk.width ||
            y < 0 || y >= Chunk.height ||
            z < 0 || z >= Chunk.width
        ){
            return false;
        }
        this.blocks[(y*Chunk.width*Chunk.width + z*Chunk.width + x)*2 + 1] = val;
        return true;
    }
}