import {Player} from "./player.js"

export class Input {
    static mouse_sensitivity = 0.1;

    static left = false;
    static right = false;
    static forward = false;
    static backward = false;

    static mousemove(event){
        if (document.pointerLockElement != null){
            Player.humanoid.head_rotation_x -= Input.mouse_sensitivity * event.movementY;
            Player.humanoid.head_rotation_y -= Input.mouse_sensitivity * event.movementX;
        }
    }

    static keydown(event){
        switch (event.code){
            case "KeyA": Input.left = true; break;
            case "KeyD": Input.right = true; break;
            case "KeyS": Input.backward = true; break;
            case "KeyW": Input.forward = true; break;
        }
    }
    
    static keyup(event){
        switch (event.code){
            case "KeyA": Input.left = false; break;
            case "KeyD": Input.right = false; break;
            case "KeyS": Input.backward = false; break;
            case "KeyW": Input.forward = false; break;
        }
    }
    
    static init(){
        canvas.addEventListener("click", async () => {
            await canvas.requestPointerLock({
                unadjustedMovement: true,
            });
        });
        document.addEventListener("mousemove",Input.mousemove);
        document.addEventListener("keydown",Input.keydown);
        document.addEventListener("keyup",Input.keyup);
    }
}