import * as Graphics from "./graphics.js";
import {gl, canvas} from "./graphics.js"
import {Color} from "./color.js"
import {BlockType} from "./blocktype.js"
import {Palette} from "./palette.js"
import {Input} from "./input.js";

function rect(x, y, z, width, height){
    Graphics.position(x, y+height, z);
    Graphics.position(x, y, z);
    Graphics.position(x+width, y, z);
    Graphics.position(x+width, y, z);
    Graphics.position(x+width, y+height, z);
    Graphics.position(x, y+height, z);
}

function hollow_rect(x, y, z, width, height, thickness){
    rect(x,y,z,width,thickness);
    rect(x,y+thickness,z,thickness,height-thickness);
    rect(x+width-thickness,y+thickness,z,thickness,height-thickness);
    rect(x,y+height-thickness,z,width,thickness);
}

function hollow_rect_centered(x, y, z, width, height, thickness){
    hollow_rect(x - width/2, y - height/2, z, width, height, thickness);
}

export class Gui {

    static draw(){
        Graphics.project_ortho(0,canvas.width,0,canvas.height,-100,100);
        Graphics.load_identity();

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ONE_MINUS_SRC_COLOR);
        gl.disable(gl.DEPTH_TEST);
        Graphics.begin_tris();
        Graphics.color(255, 255, 255, 127);
        const radius = 2;
        const thickness = 2;
        const big_radius = radius + thickness;
        const n_vertices = 16;
        const d = 2*Math.PI / n_vertices;
        const center_x = canvas.width/2;
        const center_y = canvas.height/2;
        for (var i = 0; i < n_vertices; i++){
            var angle0 = i * d;
            var angle1 = (i + 1) * d;
            var x0 = Math.cos(angle0);
            var x1 = Math.cos(angle1);
            var y0 = Math.sin(angle0);
            var y1 = Math.sin(angle1);
            
            Graphics.position(center_x + big_radius * x1, center_y + big_radius * y1, 0);
            Graphics.position(center_x + radius * x1, center_y + radius * y1, 0);
            Graphics.position(center_x + radius * x0, center_y + radius * y0, 0);

            Graphics.position(center_x + radius * x0, center_y + radius * y0, 0);
            Graphics.position(center_x + big_radius * x0, center_y + big_radius * y0, 0);
            Graphics.position(center_x + big_radius * x1, center_y + big_radius * y1, 0);
        }
        Graphics.end();
        gl.disable(gl.BLEND);

        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        BlockType.types.forEach((type, index)=>{
            const block_size = 50;
            const total_width = BlockType.types.length * block_size;
            var x = center_x - total_width/2 + block_size/2 + index * block_size;
            var y = 100;

            Graphics.begin_tris();
            if (index == Input.selected_block_id.get()){
                Graphics.color(255,0,0,255);
                hollow_rect_centered(x,y,1,56,56,6);
            } else {
                Graphics.color(0,0,0,255);
                hollow_rect_centered(x,y,0,54,54,4);
            }
            Graphics.end();
        });

        BlockType.types.forEach((type, index)=>{
            const block_size = 50;
            const total_width = BlockType.types.length * block_size;
            var x = center_x - total_width/2 + block_size/2 + index * block_size;
            var y = 100;

            Graphics.push();
            Graphics.translate(x,y,0);
            Graphics.scale(block_size/2,block_size/2,block_size/2);
            Graphics.rotate_x(30);
            Graphics.rotate_y(45);
            Graphics.translate(-.5,-.5,-.5);
            Graphics.begin_tris();
            type.draw(Palette.get(Input.selected_block_color_id.get()));
            Graphics.end();
            Graphics.pop();
        });
        
    }
}