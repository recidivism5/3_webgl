import {BlockType} from "./blocktype.js"
import {World} from "./world.js"
import {Frame} from "./frame.js"
import {Input} from "./input.js"

async function main(){
    window.canvas = document.querySelector("#canvas");
    window.gl = canvas.getContext("webgl", {antialias: false});
    if (!gl){
        return;
    }

    async function load_shader(name){
        var vsRes = await fetch("shaders/"+name+"/vert");
        var vsSrc = await vsRes.text();
    
        var fsRes = await fetch("shaders/"+name+"/frag");
        var fsSrc = await fsRes.text();
    
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vsSrc);
        gl.compileShader(vertexShader);
    
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
        }
    
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fsSrc);
        gl.compileShader(fragmentShader);
    
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShader));
        }
    
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program));
        }
    
        return program;
    }

    window.color_shader = await load_shader("color");

    BlockType.init();

    World.init();

    Input.init();

    requestAnimationFrame(Frame.do);
}

main();