import {epsilon} from "./epsilon.js"

export class Vec3 {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static from_array(a){
        return new Vec3(a[0],a[1],a[2]);
    }

    static from_array_array(a){
        var va = [];
        for (var i = 0; i < a.length; i++){
            va.push(Vec3.from_array(a[i]));
        }
        return va;
    }

    add(v){
        return new Vec3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    sub(v){
        return new Vec3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    scale(s){
        return new Vec3(
            this.x * s,
            this.y * s,
            this.z * s
        );
    }

    dot(v){
        return this.x*v.x + this.y*v.y + this.z*v.z;
    }

    cross(v){
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    normalize(){
        var invmag = 1.0 / Math.sqrt(this.dot(this));
        return this.scale(invmag);
    }

    negate(){
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
    }

    equal(v){
        return Math.abs(this.x - v.x) <= epsilon &&
               Math.abs(this.y - v.y) <= epsilon &&
               Math.abs(this.z - v.z) <= epsilon;
    }
}