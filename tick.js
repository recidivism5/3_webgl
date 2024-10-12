import {Player} from "./player.js"
import {World} from "./world.js"

export function tick(){
    Player.tick();
    World.dude.tick();
}

export function interpolate(t){
    Player.interpolate(t);
    World.dude.interpolate(t);
}