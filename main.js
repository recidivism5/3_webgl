import {Vec3} from "./vec3.js"
import * as Mat4Stack from "./mat4_stack.js"
import * as ShapeGen from "./shapegen.js"
import * as BlockTypes from "./blocktypes.js"

async function main(){
    var canvas = document.querySelector("#canvas");
    window.gl = canvas.getContext("webgl");
    if (!gl){
        return;
    }

    gl.getExtension('OES_standard_derivatives');

    async function load_shader(name){
        var vsRes = await fetch("shaders/"+name+"/vs.glsl");
        var vsSrc = await vsRes.text();
    
        var fsRes = await fetch("shaders/"+name+"/fs.glsl");
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

    function set_attrib(shader, name, size, type, stride, offset){
        var loc = gl.getAttribLocation(shader,name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc,size,type,gl.FALSE,stride,offset);
    }

    var wireframe_shader = await load_shader("wireframe");

    BlockTypes.init();

    var before = -1.0;
    var accumulated_time = 0.0;
    var interpolant = 0.0;
    const TICK_RATE = 20.0;
    const SEC_PER_TICK = 1.0 / TICK_RATE;

    var btcounter = 0;
    var bt = 0;

    function tick(){
        btcounter++;
        if (btcounter == 9){
            btcounter = 0;
            bt++;
            if (bt > BlockTypes.blocktypes.length-1){
                bt = 0;
            }
        }
    }

    function frame(now){
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
        interpolant = accumulated_time / SEC_PER_TICK;
    
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        gl.viewport(0,0,canvas.width,canvas.height);
    
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(wireframe_shader);

        Mat4Stack.mode(Mat4Stack.PROJECTION);
        Mat4Stack.load_identity();
        Mat4Stack.perspective(90,canvas.width/canvas.height,0.01,100.0);
        Mat4Stack.mode(Mat4Stack.MODELVIEW);
        Mat4Stack.load_identity();
        Mat4Stack.rotate_x(35);
        Mat4Stack.translate(0,-4,-6);
        Mat4Stack.rotate_y(now*90);
        Mat4Stack.rotate_x(now*30);
        Mat4Stack.translate(-1,-1,-1);
        Mat4Stack.upload(wireframe_shader);

        gl.bindBuffer(gl.ARRAY_BUFFER,BlockTypes.blocktypes[bt].tri_vbo);
        set_attrib(wireframe_shader,"a_position",3,gl.FLOAT,6*4,0);
        set_attrib(wireframe_shader,"a_barycentric",3,gl.FLOAT,6*4,3*4);
        gl.drawArrays(gl.TRIANGLES,0,BlockTypes.blocktypes[bt].tri_vcount);
    
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

main();