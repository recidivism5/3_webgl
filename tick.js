import {Player} from "./player.js"

export class Tick {
    static do(){
        Player.tick();
    }

    static interpolate(t){
        Player.interpolate(t);
    }
}