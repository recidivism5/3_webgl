import {ConvexPolyhedron} from "./convex_polyhedron.js"
import {Vec3} from "./vec3.js"

async function main(){
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl");
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

    var wireframe_shader = await load_shader("wireframe");

    function frame(now){
        now *= 0.001; // convert to seconds
    
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    
        gl.viewport(0,0,canvas.width,canvas.height);
    
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(wireframe_shader);
    
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

main();
var tetrahedron = new ConvexPolyhedron(Vec3.from_array_array([[0,0,0],[0,1,0],[1,1,0],[0,1,1]]));
tetrahedron.log_faces();