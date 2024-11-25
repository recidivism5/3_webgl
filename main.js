import * as BlockType from "./blocktype.js"
import * as Terrain from "./terrain.js"
import * as Input from "./input.js"
import * as Graphics from "./graphics.js"
import { Player } from "./player.js"
import { Dude } from "./dude.js"
import { Head } from "./head.js"
import {Gui} from "./gui.js"
import {gl, canvas} from "./graphics.js"
import * as Palette from "./palette.js"

export var player;
export var entities = [];

async function main(){
    if (!Graphics.init()){
        return;
    }

    BlockType.init();

    Terrain.init();

    Terrain.set_block(0,1,0, 2,4);
    Terrain.set_block(0,1,-1, 2,4);
    Terrain.set_block(-2,1,0, 4,4);
    Terrain.set_block(-2,1,-1, 4,4);
    Terrain.set_block(3,1,2, 6,4);
    Terrain.set_block(4,1,2, 6,4);
    Terrain.set_block(5,1,3, 2,4);
    Terrain.set_block(6,1,3, 2,4);

    player = new Player(4, 4, 4);

    entities.push(new Dude(0,8,0));
    entities.push(new Head(4,8,0,1));
    entities.push(new Head(4,8,2,1));
    entities.push(new Head(4,8,4,.5));
    entities.push(new Head(2,8,6,.25));
    entities.push(new Head(4,8,8,.125));
    entities.push(new Head(0,8,10,.0625));

    Input.init();

    requestAnimationFrame(main_loop);
}

main();

var before = -1.0;
var accumulated_time = 0.0;
const TICK_RATE = 20.0;
const SEC_PER_TICK = 1.0 / TICK_RATE;

export function tick(){
    player.tick();
    for (var i = 0; i < entities.length; i++){
        entities[i].tick();
    }
}

export function interpolate(t){
    player.interpolate(t);
    for (var i = 0; i < entities.length; i++){
        entities[i].interpolate(t);
    }
}

export function main_loop(now){
    now *= 0.001; //convert to seconds
    if (before <= 0.0){
        before = now;
    }
    accumulated_time += now - before;
    accumulated_time = Math.min(accumulated_time, 1);
    before = now;
    while (accumulated_time >= SEC_PER_TICK){
        accumulated_time -= SEC_PER_TICK;
        tick();
    }
    interpolate(accumulated_time / SEC_PER_TICK);

    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.viewport(0,0,canvas.width,canvas.height);

    gl.clearColor(0.6588,0.9568,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    player.update_raycast();

    player.use_camera();

    Terrain.draw();

    if (player.raycast){
        var pos = player.raycast.position.clone();
        var block_id = Terrain.get_block_id(pos.x, pos.y, pos.z);
        var block_type = BlockType.get(block_id);
        block_type.draw_wireframe(pos.x, pos.y, pos.z);
        pos.add(player.raycast.normal);
        block_type = BlockType.get(Input.get_selected_block_id());
        var color = Palette.get(Input.selected_block_color_id.get()).clone();
        color.a = 127;
        Graphics.push();
            Graphics.translate(pos.x, pos.y, pos.z);
            Graphics.begin_tris();
            block_type.draw(color);
            Graphics.end();
        Graphics.pop();
    }

    for (var i = 0; i < entities.length; i++){
        entities[i].draw(now);
    }

    Gui.draw();
    
    requestAnimationFrame(main_loop);
}