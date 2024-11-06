import {tick, interpolate} from "./tick.js"
import {World} from "./world.js"
import {Player} from "./player.js"
import {Gui} from "./gui.js"
import * as BlockType from "./blocktype.js"
import * as Graphics from "./graphics.js"
import {gl, canvas} from "./graphics.js"
import {Dude} from "./dude.js"
import { Input } from "./input.js"
import { Palette } from "./palette.js"

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

    gl.clearColor(1.0,1.0,1.0,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    Player.update_raycast();

    Player.use_camera();

    World.draw();

    World.dude.draw(now);
    World.dude.draw_wireframe();

    if (Player.raycast){
        var pos = Player.raycast.position.clone();
        pos.add(Player.raycast.normal);
        var block_type = BlockType.get(Input.get_selected_block_id());
        var color = Palette.get(Input.selected_block_color_id.get()).clone();
        color.a = 127;
        Graphics.push();
            Graphics.translate(pos.x, pos.y, pos.z);
            Graphics.begin_tris();
            block_type.draw(color);
            Graphics.end();
        Graphics.pop();
    }

    Gui.draw();
    
    requestAnimationFrame(main_loop);
}