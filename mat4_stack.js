import * as Mat4 from "./mat4.js"

var modelview = [Mat4.create()];
var projection = [Mat4.create()];

var temp = Mat4.create();

var cur = modelview;

function get(){
    return cur[cur.length-1];
}

function apply(){
    Mat4.mul(get(),get(),temp);
}

export const MODELVIEW = 0;
export const PROJECTION = 1;

export function mode(id){
    if (id == MODELVIEW){
        cur = modelview;
    } else if (id == PROJECTION){
        cur = projection;
    } else {
        console.error("invalid mat4 stack id:",id);
    }
}

export function push(){
    cur.push(Mat4.clone(get()));
}

export function pop(){
    if (cur.length > 1){
        cur.pop();
    }
}

export function upload(gl, shader){
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_modelview"),gl.FALSE,modelview[modelview.length-1]);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_projection"),gl.FALSE,projection[projection.length-1]);
}

export function load_identity(){
    Mat4.identity(get());
}

export function scale(x,y,z){
    Mat4.scale(temp,x,y,z);
    apply();
}

export function translate(x,y,z){
    Mat4.translate(temp,x,y,z);
    apply();
}

export function rotate_x(degrees){
    Mat4.rotate_x(temp,degrees);
    apply();
}

export function rotate_y(degrees){
    Mat4.rotate_y(temp,degrees);
    apply();
}

export function rotate_z(degrees){
    Mat4.rotate_z(temp,degrees);
    apply();
}

export function perspective(fovy_degrees, aspect, near, far){
    Mat4.perspective_rh_no(temp,fovy_degrees,aspect,near,far);
    apply();
}