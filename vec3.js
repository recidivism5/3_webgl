import {epsilon} from "./epsilon.js"

export function create(){
    return new Float32Array([0,0,0]);
}

export function from_values(x,y,z){
    return new Float32Array([x,y,z]);
}

export function clone(v){
    return new Float32Array(v);
}

export function from_array(arr){
    return new Float32Array(arr);
}

export function from_array_array(arr){
    var va = [];
    for (var i = 0; i < arr.length; i++){
        va.push(from_array(arr[i]));
    }
    return va;
}

export function add(out,a,b){
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
}

export function sub(out,a,b){
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
}

export function scale(out,a,s){
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
}

export function dot(a,b){
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

export function cross(out,a,b){
    var ac = clone(a);
    var bc = clone(b);
    out[0] = ac[1]*bc[2] - ac[2]*bc[1];
    out[1] = ac[2]*bc[0] - ac[0]*bc[2];
    out[2] = ac[0]*bc[1] - ac[1]*bc[0];
}

export function normalize(out,a){
    var invmag = 1.0 / Math.sqrt(dot(a,a));
    scale(out,a,invmag);
}

export function negate(out,a){
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
}

export function equal(a,b){
    return Math.abs(a[0] - b[0]) <= epsilon &&
           Math.abs(a[1] - b[1]) <= epsilon &&
           Math.abs(a[2] - b[2]) <= epsilon;
}