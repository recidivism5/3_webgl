import {Chunk} from "./chunk.js"
import {Vec3} from "./vec3.js"

export class World {
    static chunks = new Map();

    static init(){
        for (var z = 0; z <= 2; z++){
            for (var x = 0; x <= 2; x++){
                var chunk = new Chunk(x, z);
                World.chunks.set(chunk.get_key(), chunk);
            }
        }
    }
    
    static draw(){
        World.chunks.forEach((chunk,key)=>{
            chunk.draw();
        });
    }

    static to_chunk_local(component){
        return (Chunk.width + (component % Chunk.width)) % Chunk.width;
    }

    static to_chunk_global(component){
        return (component < 0 ? -1 : 0) + Math.trunc(component / Chunk.width);
    }

    static get_chunk(x, z){
        var key = Chunk.get_key(x, z);
        return World.chunks.get(key);
    }

    static get_chunk_from_block_coords(x, z){
        return World.get_chunk(
            World.to_chunk_global(x),
            World.to_chunk_global(z)
        );
    }

    static get_block_id(x, y, z){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return -1;
        return chunk.get_block_id(
            World.to_chunk_local(x),
            y,
            World.to_chunk_local(z)
        );
    }

    static set_block_id(x, y, z, val){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return;
        return chunk.set_block_id(
            World.to_chunk_local(x),
            y,
            World.to_chunk_local(z),
            val
        );
    }

    static set_block_color_id(x, y, z, val){
        var chunk = World.get_chunk_from_block_coords(x, z);
        if (chunk == undefined) return;
        return chunk.set_block_color_id(
            World.to_chunk_local(x),
            y,
            World.to_chunk_local(z),
            val
        );
    }
}