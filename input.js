import {player} from "./main.js"
import * as BlockType from "./blocktype.js"
import * as Terrain from "./terrain.js"
import {Palette} from "./palette.js";
import { RingValue } from "./ringvalue.js";

export var mouse_sensitivity = 0.1;

export var left = false;
export var right = false;
export var forward = false;
export var backward = false;
export var jump = false;

export var selected_block_base_id = null;
export var selected_block_color_id = null;
export var rotations = [];

export var color_mod = false;

export function get_selected_block_id(){
    return BlockType.base_type_ids[selected_block_base_id.get()] + 
           rotations[selected_block_base_id.get()].get();
}

function mousemove(event){
    if (document.pointerLockElement != null){
        player.head_rotation_x -= mouse_sensitivity * event.movementY;
        player.head_rotation_y -= mouse_sensitivity * event.movementX;
    }
}

function mousedown(event){
    if (player.raycast != null){
        var pos = player.raycast.position;
        var normal = player.raycast.normal;
        switch (event.button){
            case 0: 
                Terrain.set_block_id(
                    pos.x,
                    pos.y,
                    pos.z,
                    0
                );
                break;
            case 2:
                Terrain.set_block_id(
                    pos.x + normal.x,
                    pos.y + normal.y,
                    pos.z + normal.z,
                    get_selected_block_id()
                );
                Terrain.set_block_color_id(
                    pos.x + normal.x,
                    pos.y + normal.y,
                    pos.z + normal.z,
                    selected_block_color_id.get()
                );
                break;
        }
    }
}

function wheel(event){
    var inc = Math.sign(event.deltaY);
    if (color_mod){
        selected_block_color_id.add(inc);
    } else {
        selected_block_base_id.add(inc);
    }
}

function keydown(event){
    switch (event.code){
        case "KeyA": left = true; break;
        case "KeyD": right = true; break;
        case "KeyS": backward = true; break;
        case "KeyW": forward = true; break;
        case "KeyT": player.physics_enabled = !player.physics_enabled; break;
        case "KeyC": color_mod = true; break;
        case "Space": jump = true; break;
        case "KeyR": rotations[selected_block_base_id.get()].add(1); break;
        case "KeyF": rotations[selected_block_base_id.get()].add(-1); break;
        case "KeyQ": selected_block_color_id.add(1); break;
        case "KeyE": selected_block_color_id.add(-1); break;
        case "Digit1": selected_block_base_id.set(0); break;
        case "Digit2": selected_block_base_id.set(1); break;
        case "Digit3": selected_block_base_id.set(2); break;
        case "Digit4": selected_block_base_id.set(3); break;
        case "Digit5": selected_block_base_id.set(4); break;
        case "Digit6": selected_block_base_id.set(5); break;
    }
}

function keyup(event){
    switch (event.code){
        case "KeyA": left = false; break;
        case "KeyD": right = false; break;
        case "KeyS": backward = false; break;
        case "KeyW": forward = false; break;
        case "Space": jump = false; break;
        case "KeyC": color_mod = false; break;
    }
}

export function init(){
    canvas.addEventListener("click", async () => {
        await canvas.requestPointerLock({
            unadjustedMovement: true,
        });
    });
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("wheel", wheel);
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    selected_block_base_id = new RingValue(BlockType.base_type_ids.length,0);
    selected_block_color_id = new RingValue(Palette.colors.length,0);
    for (var i = 0; i < BlockType.base_type_ids.length-1; i++){
        rotations.push(
            new RingValue(
                BlockType.base_type_ids[i+1] - BlockType.base_type_ids[i],
                0
            )
        );
    }
    rotations.push(
        new RingValue(
            BlockType.types.length - BlockType.base_type_ids[i],
            0
        )
    );
}