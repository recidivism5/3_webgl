import {BlockType} from "./blocktype.js"
import {World} from "./world.js"
import {main_loop} from "./mainloop.js"
import {Input} from "./input.js"
import * as Graphics from "./graphics.js"
import { Player } from "./player.js"

async function main(){
    if (!Graphics.init()){
        return;
    }

    BlockType.init();

    World.init();

    World.set_block(0,1,0,2,4,0);
    World.set_block(0,1,-1,2,4,0);

    Player.init();

    Input.init();

    requestAnimationFrame(main_loop);
}

main();