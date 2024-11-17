import {Chunk} from "./chunk.js"
import {Vec3} from "./vec3.js"
import * as Graphics from "./graphics.js"

var chunks = new Map();

export function init(){
    for (var z = -2; z <= 2; z++){
        for (var x = -2; x <= 2; x++){
            var chunk = new Chunk(x, z);
            chunks.set(chunk.get_key(), chunk);
        }
    }
}

export function draw(){
    Graphics.use_texture();
    Graphics.bind_texture("grass_grey.png");
    chunks.forEach((chunk,key)=>{
        chunk.draw();
    });
}

export function get_block_offset(component){
    return component & 0xf;
}

export function get_chunk_coord(component){
    return component >> 4;
}

export function get_chunk(x, z){
    var key = Chunk.get_key(x, z);
    return chunks.get(key);
}

export function get_chunk_from_block_coords(x, z){
    return get_chunk(
        get_chunk_coord(x),
        get_chunk_coord(z)
    );
}

export function get_block_id(x, y, z){
    var chunk = get_chunk_from_block_coords(x, z);
    if (chunk == undefined) return -1;
    return chunk.get_block_id(
        get_block_offset(x),
        y,
        get_block_offset(z)
    );
}

export function set_block_id(x, y, z, val){
    var chunk = get_chunk_from_block_coords(x, z);
    if (chunk == undefined) return;
    return chunk.set_block_id(
        get_block_offset(x),
        y,
        get_block_offset(z),
        val
    );
}

export function set_block_color_id(x, y, z, val){
    var chunk = get_chunk_from_block_coords(x, z);
    if (chunk == undefined) return;
    return chunk.set_block_color_id(
        get_block_offset(x),
        y,
        get_block_offset(z),
        val
    );
}

export function get_block(x, y, z){
    var chunk = get_chunk_from_block_coords(x, z);
    if (chunk == undefined) return -1;
    return chunk.get_block(
        get_block_offset(x),
        y,
        get_block_offset(z)
    );
}

export function set_block(x, y, z, id, color_id, light){
    var chunk = get_chunk_from_block_coords(x, z);
    if (chunk == undefined) return;
    return chunk.set_block(
        get_block_offset(x),
        y,
        get_block_offset(z),
        id,
        color_id,
        light
    );
}