import {Player} from "./player.js"
import {BlockType} from "./blocktype.js"
import {World} from "./world.js"
import {Palette} from "./palette.js";
import { RingValue } from "./ringvalue.js";

export class Input {
    static mouse_sensitivity = 0.1;

    static left = false;
    static right = false;
    static forward = false;
    static backward = false;

    static selected_block_id = null;
    static selected_block_color_id = null;

    static color_mod = false;

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
                        Input.selected_block_id.get()
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
            Input.selected_block_id.add(inc);
        }
    }

    static keydown(event){
        switch (event.code){
            case "KeyA": Input.left = true; break;
            case "KeyD": Input.right = true; break;
            case "KeyS": Input.backward = true; break;
            case "KeyW": Input.forward = true; break;
            //case "KeyF": Player.humanoid.entity.physics_enabled = !Player.humanoid.entity.physics_enabled; break;
            case "KeyC": Input.color_mod = true; break;
            case "Space": Player.humanoid.entity.velocity.y = 0.4; break;
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

        Input.selected_block_id = new RingValue(BlockType.types.length,0);
        Input.selected_block_color_id = new RingValue(Palette.colors.length,0);
    }
}