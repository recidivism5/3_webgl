import {Chunk} from "./chunk.js"
import {Vec3} from "./vec3.js"
import * as Graphics from "./graphics.js"
import { Dude } from "./dude.js";

export class World {
    static chunks = new Map();

    static dude;

    static init(){
        for (var z = -2; z <= 2; z++){
            for (var x = -2; x <= 2; x++){
                var chunk = new Chunk(x, z);
                World.chunks.set(chunk.get_key(), chunk);
            }
        }

        World.dude = new Dude(0, 4, 0);
    }
    
    static draw(){
        Graphics.use_color();
        World.chunks.forEach((chunk,key)=>{
            chunk.draw();
        });
    }

    static get_block_offset(component){
        return component & 0xf;
    }

    static get_chunk_coord(component){
        return component >> 4;
    }

    static get_chunk(x, z){
        var key = Chunk.get_key(x, z);
        return World.chunks.get(key);
    }

    static get_chunk_from_block_coords(x, z){
        return World.get_chunk(
            World.get_chunk_coord(x),
            World.get_chunk_coord(z)
        );
    }

    static get_block_id(x, y, z){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return -1;
        return chunk.get_block_id(
            World.get_block_offset(x),
            y,
            World.get_block_offset(z)
        );
    }

    static set_block_id(x, y, z, val){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return;
        return chunk.set_block_id(
            World.get_block_offset(x),
            y,
            World.get_block_offset(z),
            val
        );
    }

    static set_block_color_id(x, y, z, val){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return;
        return chunk.set_block_color_id(
            World.get_block_offset(x),
            y,
            World.get_block_offset(z),
            val
        );
    }

    static get_block(x, y, z){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return -1;
        return chunk.get_block(
            World.get_block_offset(x),
            y,
            World.get_block_offset(z)
        );
    }

    static set_block(x, y, z, id, color_id, light){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return;
        return chunk.set_block(
            World.get_block_offset(x),
            y,
            World.get_block_offset(z),
            id,
            color_id,
            light
        );
    }
}