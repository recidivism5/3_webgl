import {Color} from "./color.js"
import * as random from "./random.js"

export class Palette {
    static colors = [
        //https://lospec.com/palette-list/sweetie-16
        new Color(0x1a,0x1c,0x2c,0xff),
        new Color(0x5d,0x27,0x5d,0xff),
        new Color(0xb1,0x3e,0x53,0xff),
        new Color(0xef,0x7d,0x57,0xff),
        new Color(0xff,0xcd,0x75,0xff),
        new Color(0xa7,0xf0,0x70,0xff),
        new Color(0x38,0xb7,0x64,0xff),
        new Color(0x25,0x71,0x79,0xff),
        new Color(0x29,0x36,0x6f,0xff),
        new Color(0x3b,0x5d,0xc9,0xff),
        new Color(0x41,0xa6,0xf6,0xff),
        new Color(0x73,0xef,0xf7,0xff),
        new Color(0xf4,0xf4,0xf4,0xff),
        new Color(0x94,0xb0,0xc2,0xff),
        new Color(0x56,0x6c,0x86,0xff),
        new Color(0x33,0x3c,0x57,0xff),
    ];

    static get(id){
        return Palette.colors[id];
    }

    static get_random_id(){
        return random.rand_int(Palette.colors.length);
    }

    static get_nearest_id(r, g, b){

    }
}