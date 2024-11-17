import * as BlockType from "./blocktype.js"
import * as Terrain from "./terrain.js"
import {main_loop} from "./mainloop.js"
import {Input} from "./input.js"
import * as Graphics from "./graphics.js"
import { Player } from "./player.js"

async function main(){
    if (!Graphics.init()){
        return;
    }

    BlockType.init();

    Terrain.init();

    Terrain.set_block(0,1,0, 2,4,0);
    Terrain.set_block(0,1,-1, 2,4,0);
    Terrain.set_block(-2,1,0, 4,4,0);
    Terrain.set_block(-2,1,-1, 4,4,0);
    Terrain.set_block(3,1,2, 6,4,0);
    Terrain.set_block(4,1,2, 6,4,0);
    Terrain.set_block(5,1,3, 2,4,0);
    Terrain.set_block(6,1,3, 2,4,0);

    Player.init();

    Input.init();

    requestAnimationFrame(main_loop);
}

main();