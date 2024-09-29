import {Mat4Stack} from "./mat4stack.js";

const vertex_size = 4*4;

var vertices = new ArrayBuffer(vertex_size * 65536);
var f32 = new Float32Array(vertices);
var u8 = new Uint8Array(vertices);
var vcount = 0;
var _color = [255,255,255,255];
var type = null;

function setattrib(name, size, type, normalize, stride, offset){
    var shader = gl.getParameter(gl.CURRENT_PROGRAM);
    var loc = gl.getAttribLocation(shader,name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,size,type,normalize,stride,offset);
}

export class Immediate {

    static begin_tris(){
        type = gl.TRIANGLES;
        vcount = 0;
    }

    static begin_lines(){
        type = gl.LINES;
        vcount = 0;
    }
    
    static color(r, g, b, a){
        _color[0] = r;
        _color[1] = g;
        _color[2] = b;
        _color[3] = a;
    }
    
    static position(x, y, z){
        var f32offset = vcount * 4;
        var u8offset = vcount * 4 * 4 + 3*4;
        f32.set([x,y,z],f32offset);
        u8.set(_color,u8offset);
        vcount++;
    }
    
    static end(){
        Mat4Stack.upload();

        var vbo = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
        gl.bufferData(gl.ARRAY_BUFFER,f32.subarray(0,vcount*4),gl.STATIC_DRAW);
        setattrib("a_position",3,gl.FLOAT,false,vertex_size,0);
        setattrib("a_color",4,gl.UNSIGNED_BYTE,true,vertex_size,3*4);
        gl.drawArrays(type,0,vcount);
    
        /*
        var s = "";
        for (var i = 0; i < vcount; i++){
            for (var j = 0; j < 3; j++) s += f32[i*6+j] + ", ";
            for (var j = 0; j < 3*4; j++) s += u8[i*6*4+3*4+j] + ", ";
            s += "\n";
        }
        console.log(s);
        */
        
        gl.deleteBuffer(vbo);
    }
}