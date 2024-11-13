import {Vec3} from "./vec3.js"
import {Mat4} from "./mat4.js"

const color_vert_src = 
`
attribute vec3 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_color = a_color;
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}
`;

const color_frag_src =
`
precision mediump float;

varying vec4 v_color;

void main(){
	gl_FragColor = v_color;
}
`

const texture_vert_src = 
`
attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_color;

varying vec2 v_texcoord;
varying vec4 v_color;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_texcoord = a_texcoord;
    v_color = a_color;
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}
`;

const texture_frag_src =
`
precision mediump float;

varying vec2 v_texcoord;
varying vec4 v_color;

uniform sampler2D u_sampler;

void main(){
	gl_FragColor = v_color * texture2D(u_sampler, v_texcoord);
}
`

const direct_vert_src =
`
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec4 a_color;

varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_normal = normalize(vec3(u_modelview * vec4(a_normal,0.0)));
    v_texcoord = a_texcoord;
    v_color = a_color;
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}
`

const direct_frag_src =
`
precision mediump float;

varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform float u_ambient;
uniform vec3 u_light_vec0;
uniform vec3 u_light_vec1;

uniform sampler2D u_sampler;

void main(){
	vec4 sample = texture2D(u_sampler, v_texcoord);
    if (sample.a < 1.0) discard;
    float brightness = min(
		1.0,
		max(
			max(
				0.0,
				dot(v_normal,u_light_vec0)
			),
			dot(v_normal,u_light_vec1)
		) * (1.0 - u_ambient) + u_ambient
	);
	gl_FragColor = vec4(brightness * sample.rgb * v_color.rgb, sample.a);
}
`

function compile_shader(vsSrc, fsSrc){
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

function set_attrib(name, size, type, normalize, stride, offset){
    var shader = gl.getParameter(gl.CURRENT_PROGRAM);
    var loc = gl.getAttribLocation(shader,name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,size,type,normalize,stride,offset);
}

var color_shader,
    texture_shader,
    direct_shader;

const color_vertex_size = 4*4;

const buffer_size = color_vertex_size * 65536;

var vertices = new ArrayBuffer(buffer_size);
var f32 = new Float32Array(vertices);
var u8 = new Uint8Array(vertices);
var vcount = 0;
var vertex_size = 0;
var type = null;
var vbo = null;
var _color = new Uint8Array([255,255,255,255]);
var _normal = new Float32Array([0,0,1]);
var _texcoord = new Float32Array([0,0]);

var textures = new Map();
var bound_texture_res = 0;

var shader;

export var canvas;
export var gl;
export const ambient = 0.25;
export const light_vec0 = new Vec3(2,3,1).normalize();
export const light_vec1 = new Vec3(-2,3,-1).normalize();

export function bind_texture(name){
    var texture = textures.get(name);
    if (texture == undefined){
        texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // flip textures vertically

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel,
        );

        texture.res = width;

        textures.set(name, texture);

        var image = new Image();
        
        image.onload = () => {
            var old_texture = gl.getParameter(gl.TEXTURE_BINDING_2D);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image,
            );

            texture.res = image.naturalWidth;

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            //gl.generateMipmap(gl.TEXTURE_2D);  // Create mipmaps; you must either
                                       // do this or change the minification filter.

            gl.bindTexture(gl.TEXTURE_2D, old_texture);
        };

        image.src = "./textures/"+name;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    bound_texture_res = texture.res;
}

export function init(){
    canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl", {antialias: false});
    if (!gl){
        return false;
    }

    color_shader = compile_shader(color_vert_src, color_frag_src);
    texture_shader = compile_shader(texture_vert_src, texture_frag_src);
    direct_shader = compile_shader(direct_vert_src, direct_frag_src);

    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,buffer_size,gl.DYNAMIC_DRAW);

    use_color();

    return true;
}

export function use_color(){
    shader = color_shader;
    gl.useProgram(shader);
    vertex_size = 4*4;
    set_attrib("a_position",3,gl.FLOAT,false,vertex_size,0);
    set_attrib("a_color",4,gl.UNSIGNED_BYTE,true,vertex_size,3*4);
}

export function use_texture(){
    shader = texture_shader;
    gl.useProgram(shader);
    vertex_size = (3+2)*4 + 4;
    set_attrib("a_position", 3, gl.FLOAT, false, vertex_size, 0);
    set_attrib("a_texcoord", 2, gl.FLOAT, false, vertex_size, 3*4);
    set_attrib("a_color", 4, gl.UNSIGNED_BYTE, true, vertex_size, 5*4);
    gl.uniform1i(gl.getUniformLocation(shader, "u_sampler"), 0);
}

export function use_direct(){
    shader = direct_shader;
    gl.useProgram(shader);
    vertex_size = 9*4;
    set_attrib("a_position",3,gl.FLOAT,false,vertex_size,0);
    set_attrib("a_normal",3,gl.FLOAT,false,vertex_size,3*4);
    set_attrib("a_texcoord",2,gl.FLOAT,false,vertex_size,6*4);
    set_attrib("a_color",4,gl.UNSIGNED_BYTE,true,vertex_size,8*4);

    gl.uniform1f(gl.getUniformLocation(shader, "u_ambient"), ambient);
    gl.uniform1i(gl.getUniformLocation(shader, "u_sampler"), 0);
}

export function submit_lights(){
    var lv0 = light_vec0.clone().transform_mat4_dir(get()).normalize();
    var lv1 = light_vec1.clone().transform_mat4_dir(get()).normalize();
    gl.uniform3f(gl.getUniformLocation(shader, "u_light_vec0"), lv0.x, lv0.y, lv0.z);
    gl.uniform3f(gl.getUniformLocation(shader, "u_light_vec1"), lv1.x, lv1.y, lv1.z);
}

export function begin_tris(){
    type = gl.TRIANGLES;
    vcount = 0;
}

export function begin_lines(){
    type = gl.LINES;
    vcount = 0;
}

export function color(r, g, b, a){
    _color[0] = r;
    _color[1] = g;
    _color[2] = b;
    _color[3] = a;
}

export function normal(x, y, z){
    _normal[0] = x;
    _normal[1] = y;
    _normal[2] = z;
}

export function texcoord(u, v){
    _texcoord[0] = u;
    _texcoord[1] = v;
}

export function position(x, y, z){
    switch (shader){
        case color_shader:
            var f32offset = vcount * 4;
            var u8offset = vcount * 4 * 4 + 3*4;
            f32[f32offset + 0] = x;
            f32[f32offset + 1] = y;
            f32[f32offset + 2] = z;
            u8.set(_color, u8offset);
            break;

        case texture_shader:
            var f32offset = vcount * 6;
            var u8offset = vcount * 6 * 4 + 5*4;
            f32[f32offset + 0] = x;
            f32[f32offset + 1] = y;
            f32[f32offset + 2] = z;
            f32.set(_texcoord, f32offset + 3);
            u8.set(_color, u8offset);
            break;

        case direct_shader:
            var f32offset = vcount * 9;
            var u8offset = (f32offset + 8) * 4;
            f32[f32offset + 0] = x;
            f32[f32offset + 1] = y;
            f32[f32offset + 2] = z;
            f32.set(_normal, f32offset + 3);
            f32.set(_texcoord, f32offset + 6);
            u8.set(_color, u8offset);
            break;
    }
    vcount++;
}

var modelview = [Mat4.new_identity()];
var projection = Mat4.new_identity();

export function end(){
    var shader = gl.getParameter(gl.CURRENT_PROGRAM);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_modelview"),gl.FALSE,get().to_array());
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_projection"),gl.FALSE,projection.to_array());

    gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,u8.subarray(0,vcount * vertex_size));
    
    gl.drawArrays(type,0,vcount);
}

export function get(){
    return modelview[modelview.length-1];
}

export function push(){
    modelview.push(get().clone());
    if (modelview.length > 256){
        console.error("modelview stack exceeded 256 entries");
    }
}

export function pop(){
    if (modelview.length > 1){
        modelview.pop();
    }
}

export function load_identity(){
    get().set_identity();
}

export function scale(x, y, z){
    get().scale(x, y, z);
}

export function translate(x, y, z){
    get().translate(x, y, z);
}

export function rotate_x(degrees){
    get().rotate_x(degrees);
}

export function rotate_y(degrees){
    get().rotate_y(degrees);
}

export function rotate_z(degrees){
    get().rotate_z(degrees);
}

export function project_perspective(fovy_degrees, aspect, near, far){
    projection.set_perspective(fovy_degrees, aspect, near, far);
}

export function project_ortho(left, right, bottom, top, near, far){
    projection.set_ortho(left,right,bottom,top,near,far);
}

export function project_identity(){
    projection.set_identity();
}

export function box(x, y, z, tx, ty){

    begin_tris();
    
    var l, r, b, t;

    const n = 0.01;

    const invres = 1 / bound_texture_res;

    normal(-1,0,0);
    l = invres*(tx+n); r = invres*(tx+x-n);
    b = invres*(ty+n); t = invres*(ty+y-n);
    texcoord(l,t); position(0,y,0);
    texcoord(l,b); position(0,0,0);
    texcoord(r,b); position(0,0,z);
    texcoord(r,b); position(0,0,z);
    texcoord(r,t); position(0,y,z);
    texcoord(l,t); position(0,y,0);

    normal(0,0,1);
    l = invres*(tx+x+n); r = invres*(tx+2*x-n);
    texcoord(l,t); position(0,y,z);
    texcoord(l,b); position(0,0,z);
    texcoord(r,b); position(x,0,z);
    texcoord(r,b); position(x,0,z);
    texcoord(r,t); position(x,y,z);
    texcoord(l,t); position(0,y,z);

    normal(1,0,0);
    l = invres*(tx+2*x+n); r = invres*(tx+3*x-n);
    texcoord(l,t); position(x,y,z);
    texcoord(l,b); position(x,0,z);
    texcoord(r,b); position(x,0,0);
    texcoord(r,b); position(x,0,0);
    texcoord(r,t); position(x,y,0);
    texcoord(l,t); position(x,y,z);

    normal(0,0,-1);
    l = invres*(tx+3*x+n); r = invres*(tx+4*x-n);
    texcoord(l,t); position(x,y,0);
    texcoord(l,b); position(x,0,0);
    texcoord(r,b); position(0,0,0);
    texcoord(r,b); position(0,0,0);
    texcoord(r,t); position(0,y,0);
    texcoord(l,t); position(x,y,0);

    normal(0,1,0);
    l = invres*(tx+x+n); r = invres*(tx+2*x-n);
    b = invres*(ty+y+n); t = invres*(ty+y+z-n);
    texcoord(l,t); position(0,y,0);
    texcoord(l,b); position(0,y,z);
    texcoord(r,b); position(x,y,z);
    texcoord(r,b); position(x,y,z);
    texcoord(r,t); position(x,y,0);
    texcoord(l,t); position(0,y,0);

    normal(0,-1,0);
    l = invres*(tx+2*x+n); r = invres*(tx+3*x-n);
    texcoord(l,t); position(0,0,z);
    texcoord(l,b); position(0,0,0);
    texcoord(r,b); position(x,0,0);
    texcoord(r,b); position(x,0,0);
    texcoord(r,t); position(x,0,z);
    texcoord(l,t); position(0,0,z);

    end();
}