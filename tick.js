import {Player} from "./player.js"

export function tick(){
    Player.tick();
}

export function interpolate(t){
    Player.interpolate(t);
}