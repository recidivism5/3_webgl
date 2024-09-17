import {epsilon} from "./epsilon.js"

export class Vec3 {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z
    }

    clone(){
        return new Vec3(this.x,this.y,this.z);
    }

    static from_array(a){
        return new Vec3(a[0],a[1],a[2]);
    }

    add(v){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    from_add(v){
        return new Vec3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    sub(v){
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    from_sub(v){
        return new Vec3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    mul(v){
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }

    from_mul(v){
        return new Vec3(
            this.x * v.x,
            this.y * v.y,
            this.z * v.z
        );
    }

    scale(s){
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    from_scale(s){
        return new Vec3(
            this.x * s,
            this.y * s,
            this.z * s
        );
    }

    negate(){
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
    }

    from_negate(){
        return new Vec3(
            -this.x,
            -this.y,
            -this.z
        );
    }

    dot(v){
        return this.x*v.x + this.y*v.y + this.z*v.z;
    }

    cross(v){
        var a = this.clone();
        this.x = a.y*v.z - a.z*v.y;
        this.y = a.z*v.x - a.x*v.z;
        this.z = a.x*v.y - a.y*v.x;
        return this;
    }

    from_cross(v){
        return new Vec3(
            this.y*v.z - this.z*v.y,
            this.z*v.x - this.x*v.z,
            this.x*v.y - this.y*v.x
        );
    }

    length2(){
        return this.dot(this);
    }

    length(){
        return Math.sqrt(this.length2());
    }

    normalize(){
        this.scale(1.0 / this.length());
        return this;
    }

    from_normalize(){
        return this.from_scale(1.0 / this.length());
    }

    distance(v){
        return this.from_sub(v).length();
    }

    equal(v){
        return Math.abs(this.x-v.x) <= epsilon &&
               Math.abs(this.y-v.y) <= epsilon &&
               Math.abs(this.z-v.z) <= epsilon;
    }

    is_zero(){
        return Math.abs(this.x) <= epsilon &&
               Math.abs(this.y) <= epsilon &&
               Math.abs(this.z) <= epsilon;
    }
}