import {BlockType} from "./blocktype.js"
import {World} from "./world.js"
import {main_loop} from "./mainloop.js"
import {Input} from "./input.js"
import * as Graphics from "./graphics.js"

async function main(){
    if (!Graphics.init()){
        return;
    }

    BlockType.init();

    World.init();

    Input.init();

    requestAnimationFrame(main_loop);
}

main();