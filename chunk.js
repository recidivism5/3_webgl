import * as Terrain from "./terrain.js"
import * as BlockType from "./blocktype.js"
import * as Graphics from "./graphics.js"
import * as Palette from "./palette.js"
import {Vec3} from "./vec3.js"
import {Player} from "./player.js"
import { Block } from "./block.js"

function cheap_hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export class Chunk {

    static width = 16;
    static height = 128;

    static get_key(x, z){
        return x.toString(16) + "," + z.toString(16);
    }

    constructor(x, z){
        this.x = x;
        this.z = z;
        this.blocks = new Uint8Array(Chunk.width*Chunk.width*Chunk.height*2);
        this.lights = new Uint8Array(Chunk.width*Chunk.width*Chunk.height);
        this.generate();
        this.neighbors = [undefined,undefined,undefined,undefined,undefined,undefined];
        this.update_neighbors();
        this.mesh = Graphics.new_mesh();
    }

    get_key(){
        return Chunk.get_key(this.x, this.z);
    }

    generate(){
        var heights = [];
        for (var z = 0; z <= Chunk.width; z+=4){
            for (var x = 0; x <= Chunk.width; x+=4){
                var hash = cheap_hash(
                    x.toString() + (this.x*16).toString() + "," +
                    z.toString() + (this.z*16).toString()
                );
                hash = Math.abs(hash);
                var height = 1 + hash % 5;
                heights.push(height);
            }
        }
        for (var z = 0; z < Chunk.width; z++){
            for (var x = 0; x < Chunk.width; x++){
                var zd = Math.floor(z / 4);
                var zm = (z % 4) / 4;
                var xd = Math.floor(x / 4);
                var xm = (x % 4) / 4;
                var a = heights[zd*4 + xd] + zm * (heights[(zd+1)*4 + xd] - heights[zd*4 + xd]);
                var b = heights[zd*4 + xd+1] + zm * (heights[(zd+1)*4 + xd+1] - heights[zd*4 + xd+1]);
                var height = Math.floor(a + xm * (b - a));
                for (var i = 0; i < height; i++){
                    this.set_block(x, i, z, 1, 5);
                }
            }
        }
    }

    update_neighbors(){
        this.neighbors[0] = Terrain.get_chunk(this.x-1,this.z);
        this.neighbors[1] = Terrain.get_chunk(this.x+1,this.z);
        this.neighbors[4] = Terrain.get_chunk(this.x,this.z-1);
        this.neighbors[5] = Terrain.get_chunk(this.x,this.z+1);
    }

    update(){
        Graphics.update_mesh(this.mesh);
        if (this.neighbors[0] != undefined) Graphics.update_mesh(this.neighbors[0].mesh);
        if (this.neighbors[1] != undefined) Graphics.update_mesh(this.neighbors[1].mesh);
        if (this.neighbors[4] != undefined) Graphics.update_mesh(this.neighbors[4].mesh);
        if (this.neighbors[5] != undefined) Graphics.update_mesh(this.neighbors[5].mesh);
    }

    draw(){
        Graphics.push();
        Graphics.translate(this.x * Chunk.width, 0, this.z * Chunk.width);
        
        Graphics.draw_mesh(this.mesh, ()=>{
            this.update_neighbors();
            var neighbor_pos = new Vec3();
            for (var y = 0; y < Chunk.height; y++){
                for (var z = 0; z < Chunk.width; z++){
                    for (var x = 0; x < Chunk.width; x++){
                        var id = this.get_block_id(x, y, z);
                        if (id == 0) continue;
                        var color_id = this.get_block_color_id(x, y, z);
                        var color = Palette.get(color_id);
                        var type = BlockType.get(id);
                        var index = 0;
                        for (var component = 0; component < 3; component++){
                            for (var direction = -1; direction <= 1; direction += 2){
                                neighbor_pos.set(x, y, z);
                                neighbor_pos.add_component(
                                    component,
                                    direction
                                );
                                var neighbor_id = this.get_block_id(
                                    neighbor_pos.x,
                                    neighbor_pos.y,
                                    neighbor_pos.z
                                );
                                if (neighbor_id == -1){
                                    neighbor_pos.set_component(
                                        component,
                                        Terrain.get_block_offset(neighbor_pos.get_component(component))
                                    );
                                    var neighbor_chunk = this.neighbors[index];
                                    if (neighbor_chunk == undefined){
                                        index++;
                                        continue;
                                    }
                                    neighbor_id = neighbor_chunk.get_block_id(
                                        neighbor_pos.x,
                                        neighbor_pos.y,
                                        neighbor_pos.z
                                    );
                                }
                                type.draw_clipped_face(x, y, z, component, index, neighbor_id, color);
                                index++;
                            }
                        }
                        type.draw_non_border_faces(x, y, z, color);
                    }
                }
            }
        });
        
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

    set_block(x, y, z, id, color_id){
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
    }

    set_block_with_update(x, y, z, id, color_id){
        this.set_block(x, y, z, id, color_id);
        this.update();
    }
}