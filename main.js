import {BlockType} from "./blocktype.js"
import {World} from "./world.js"
import {Frame} from "./frame.js"
import {Input} from "./input.js"
import * as Graphics from "./graphics.js"

async function main(){
    if (!Graphics.init()){
        return;
    }

    BlockType.init();

    World.init();

    Input.init();

    requestAnimationFrame(Frame.do);
}

main();