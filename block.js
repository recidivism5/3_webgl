import { BlockType } from "./blocktype.js"

export class Block {
    constructor(id, color_id, light){
        this.id = id;
        this.type = BlockType.get(id);
        this.color_id = color_id;
        this.light = light;
    }
}