const vertexsize = 6*4;

var vertices = new ArrayBuffer(vertexsize * 65536);
var f32 = new Float32Array(vertices);
var u8 = new Uint8Array(vertices);
var vcount = 0;
var baryi = 0;
var type = 0;

function setattrib(name, size, type, normalize, stride, offset){
    var shader = gl.getParameter(gl.CURRENT_PROGRAM);
    var loc = gl.getAttribLocation(shader,name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,size,type,normalize,stride,offset);
}

export class Immediate {
    static begin(){
        vcount = 0;
        baryi = 0;
    }
    
    static set_type(t){
        type = t;
    }
    
    static vertex(
        x, y, z,
        r, g, b, a,
        wr, wg, wb, wa
    ){
        var f32offset = vcount * 6;
        var u8offset = vcount * 6 * 4 + 3*4;
        f32.set([x,y,z],f32offset);
        var bary = [0,0,0];
        bary[baryi] = 1;
        u8.set([bary[0],bary[1],bary[2],type,r,g,b,a,wr,wg,wb,wa],u8offset);
        vcount++;
        baryi = (baryi + 1) % 3;
    }
    
    static end(){
        var vbo = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
        gl.bufferData(gl.ARRAY_BUFFER,f32.subarray(0,vcount*6),gl.STATIC_DRAW);
        setattrib("a_position",3,gl.FLOAT,false,6*4,0);
        setattrib("a_barycentric",4,gl.UNSIGNED_BYTE,false,6*4,3*4);
        setattrib("a_color",4,gl.UNSIGNED_BYTE,true,6*4,4*4);
        setattrib("a_wirecolor",4,gl.UNSIGNED_BYTE,true,6*4,5*4);
        gl.drawArrays(gl.TRIANGLES,0,vcount);
    
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