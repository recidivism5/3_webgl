import {Chunk, ChunkPos} from "./chunk.js"
import {Vec3} from "./vec3.js"

export class World {
    static chunks = new Map();

    static init(){
        for (var z = 0; z <= 2; z++){
            for (var x = 0; x <= 2; x++){
                var pos = new ChunkPos(x,z);
                World.chunks.set(pos.to_string(), new Chunk(pos));
            }
        }
    }
    
    static draw(){
        World.chunks.forEach((chunk,key)=>{
            chunk.draw();
        });
    }

    static block_pos_to_chunk_offset_component(c){
        return (Chunk.width + (c % Chunk.width)) % Chunk.width;
    }

    static block_pos_to_chunk_offset(pos){
        return new Vec3(
            World.block_pos_to_chunk_offset_component(pos.x),
            pos.y,
            World.block_pos_to_chunk_offset_component(pos.z)
        );
    }

    static get_block_id(pos){
        var chunkpos = ChunkPos.from_block_pos(pos);
        var chunk = World.chunks.get(chunkpos.to_string());
        if (chunk == undefined) return 0;
        return chunk.get_block_id(World.block_pos_to_chunk_offset(pos));
    }
}