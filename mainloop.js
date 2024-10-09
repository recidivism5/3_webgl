import {tick, interpolate} from "./tick.js"
import {World} from "./world.js"
import {Player} from "./player.js"
import {Gui} from "./gui.js"
import {BlockType} from "./blocktype.js"
import * as Graphics from "./graphics.js"
import {gl, canvas} from "./graphics.js"

var before = -1.0;
var accumulated_time = 0.0;
const TICK_RATE = 20.0;
const SEC_PER_TICK = 1.0 / TICK_RATE;

export function main_loop(now){
    now *= 0.001; //convert to seconds
    if (before <= 0.0){
        before = now;
    }
    accumulated_time += now - before;
    before = now;
    while (accumulated_time >= SEC_PER_TICK){
        accumulated_time -= SEC_PER_TICK;
        tick();
    }
    interpolate(accumulated_time / SEC_PER_TICK);

    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.viewport(0,0,canvas.width,canvas.height);

    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    Player.update_raycast();

    Player.use_camera();

    World.draw();

    Graphics.use_direct();
    Graphics.submit_lights();
    Graphics.push();
    Graphics.rotate_y(now*4);
    Graphics.begin_tris();
    Graphics.bind_texture("dude.png");
    Graphics.normal(0,0,1); Graphics.color(255,255,255,255);
    Graphics.texcoord(0,0); Graphics.position(0,1,0);
    Graphics.texcoord(1,0); Graphics.position(10,1,0);
    Graphics.texcoord(1,1); Graphics.position(10,11,0);
    Graphics.end();
    Graphics.pop();

    Graphics.use_color();

    if (Player.raycast){
        var pos = Player.raycast.position;
        var block_id = World.get_block_id(pos.x, pos.y, pos.z);
        var block_type = BlockType.get(block_id);
        block_type.draw_wireframe(pos.x, pos.y, pos.z);
    }

    Gui.draw();
    
    requestAnimationFrame(main_loop);
}