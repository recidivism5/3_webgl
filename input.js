import {Player} from "./player.js"
import * as BlockType from "./blocktype.js"
import {World} from "./world.js"
import {Palette} from "./palette.js";
import { RingValue } from "./ringvalue.js";

export class Input {
    static mouse_sensitivity = 0.1;

    static left = false;
    static right = false;
    static forward = false;
    static backward = false;

    static selected_block_base_id = null;
    static selected_block_color_id = null;
    static rotations = [];

    static color_mod = false;

    static get_selected_block_id(){
        return BlockType.base_type_ids[Input.selected_block_base_id.get()] + Input.rotations[Input.selected_block_base_id.get()].get();
    }

    static mousemove(event){
        if (document.pointerLockElement != null){
            Player.humanoid.head_rotation_x -= Input.mouse_sensitivity * event.movementY;
            Player.humanoid.head_rotation_y -= Input.mouse_sensitivity * event.movementX;
        }
    }

    static mousedown(event){
        if (Player.raycast != null){
            var pos = Player.raycast.position;
            var normal = Player.raycast.normal;
            switch (event.button){
                case 0: 
                    World.set_block_id(
                        pos.x,
                        pos.y,
                        pos.z,
                        0
                    );
                    break;
                case 2:
                    World.set_block_id(
                        pos.x + normal.x,
                        pos.y + normal.y,
                        pos.z + normal.z,
                        Input.get_selected_block_id()
                    );
                    World.set_block_color_id(
                        pos.x + normal.x,
                        pos.y + normal.y,
                        pos.z + normal.z,
                        Input.selected_block_color_id.get()
                    );
                    break;
            }
        }
    }

    static wheel(event){
        var inc = Math.sign(event.deltaY);
        if (Input.color_mod){
            Input.selected_block_color_id.add(inc);
        } else {
            Input.selected_block_base_id.add(inc);
        }
    }

    static keydown(event){
        switch (event.code){
            case "KeyA": Input.left = true; break;
            case "KeyD": Input.right = true; break;
            case "KeyS": Input.backward = true; break;
            case "KeyW": Input.forward = true; break;
            //case "KeyT": Player.humanoid.entity.physics_enabled = !Player.humanoid.entity.physics_enabled; break;
            case "KeyC": Input.color_mod = true; break;
            case "Space": Player.humanoid.entity.velocity.y = 0.45; break;
            case "KeyR": Input.rotations[Input.selected_block_base_id.get()].add(1); break;
            case "KeyF": Input.rotations[Input.selected_block_base_id.get()].add(-1); break;
            case "KeyQ": Input.selected_block_color_id.add(1); break;
            case "KeyE": Input.selected_block_color_id.add(-1); break;
            case "Digit1": Input.selected_block_base_id.set(0); break;
            case "Digit2": Input.selected_block_base_id.set(1); break;
            case "Digit3": Input.selected_block_base_id.set(2); break;
            case "Digit4": Input.selected_block_base_id.set(3); break;
            case "Digit5": Input.selected_block_base_id.set(4); break;
            case "Digit6": Input.selected_block_base_id.set(5); break;
        }
    }
    
    static keyup(event){
        switch (event.code){
            case "KeyA": Input.left = false; break;
            case "KeyD": Input.right = false; break;
            case "KeyS": Input.backward = false; break;
            case "KeyW": Input.forward = false; break;
            case "KeyC": Input.color_mod = false; break;
        }
    }
    
    static init(){
        canvas.addEventListener("click", async () => {
            await canvas.requestPointerLock({
                unadjustedMovement: true,
            });
        });
        document.addEventListener("mousemove",Input.mousemove);
        document.addEventListener("mousedown",Input.mousedown);
        document.addEventListener("wheel",Input.wheel);
        document.addEventListener("keydown",Input.keydown);
        document.addEventListener("keyup",Input.keyup);

        Input.selected_block_base_id = new RingValue(BlockType.base_type_ids.length,0);
        Input.selected_block_color_id = new RingValue(Palette.colors.length,0);
        for (var i = 0; i < BlockType.base_type_ids.length-1; i++){
            Input.rotations.push(
                new RingValue(
                    BlockType.base_type_ids[i+1] - BlockType.base_type_ids[i],
                    0
                )
            );
        }
        Input.rotations.push(
            new RingValue(
                BlockType.types.length - BlockType.base_type_ids[i],
                0
            )
        );
    }
}