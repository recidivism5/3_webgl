import {EPSILON} from "./epsilon.js"

export class Vec3 {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    clone(){
        return new Vec3(this.x,this.y,this.z);
    }

    static from_array(a){
        return new Vec3(a[0],a[1],a[2]);
    }

    copy(v){
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    set(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get_component(index){
        switch (index){
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            default: throw new Error("index is out of range: " + index);
        }
    }

    set_component(index, value){
        switch (index){
			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error("index is out of range: " + index);
		}
		return this;
    }

    add_component(index, value){
        switch (index){
			case 0: this.x += value; break;
			case 1: this.y += value; break;
			case 2: this.z += value; break;
			default: throw new Error("index is out of range: " + index);
		}
		return this;
    }

    sub_component(index, value){
        switch (index){
			case 0: this.x -= value; break;
			case 1: this.y -= value; break;
			case 2: this.z -= value; break;
			default: throw new Error("index is out of range: " + index);
		}
		return this;
    }

    add(v){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    addc(x, y, z){
        this.x += x;
        this.y += y;
        this.z += z;
        return this;
    }

    sub(v){
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    sub_scalar(s){
        this.x -= s;
        this.y -= s;
        this.z -= s;
        return this;
    }

    mul(v){
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }

    scale(s){
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    negate(){
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this;
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

    distance(v){
        return this.clone().sub(v).length();
    }

    equal(v){
        return Math.abs(this.x-v.x) <= EPSILON &&
               Math.abs(this.y-v.y) <= EPSILON &&
               Math.abs(this.z-v.z) <= EPSILON;
    }

    is_zero(){
        return Math.abs(this.x) <= EPSILON &&
               Math.abs(this.y) <= EPSILON &&
               Math.abs(this.z) <= EPSILON;
    }

    set_zero(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    abs(){
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }

    round(){
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }

    floor(){
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }

    sign(){
        this.x = Math.sign(this.x);
        this.y = Math.sign(this.y);
        this.z = Math.sign(this.z);
        return this;
    }

    step(){
        this.x = this.x < 0 ? 0 : this.x;
        this.y = this.y < 0 ? 0 : this.y;
        this.z = this.z < 0 ? 0 : this.z;
        return this;
    }

    reciprocal(){
        this.x = 1 / this.x;
        this.y = 1 / this.y;
        this.z = 1 / this.z;
        return this;
    }

    lerp(v,t){
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }

    project_onto_plane(normal){
        var c = normal.clone();
        c.scale(c.dot(this));
        this.sub(c);
    }

    rotate_x(deg){
        var rad = deg*Math.PI/180.0,
        y = this.y, z = this.z,
        s = Math.sin(rad), c = Math.cos(rad);
        this.y = y*c - z*s;
        this.z = y*s + z*c;
        return this;
    }
    
    rotate_y(deg){
        var rad = deg*Math.PI/180.0,
        x = this.x, z = this.z,
        s = Math.sin(rad), c = Math.cos(rad);
        this.x = z*s + x*c;
        this.z = z*c - x*s;
        return this;
    }
    
    rotate_z(deg){
        var rad = deg*Math.PI/180.0,
        x = this.x, y = this.y,
        s = Math.sin(rad), c = Math.cos(rad);
        this.x = x*c - y*s;
        this.y = x*s + y*c;
        return this;
    }

    transform_mat4_dir(m){
        var x = this.x * m.a11 + this.y * m.a21 + this.z * m.a31;
        var y = this.x * m.a12 + this.y * m.a22 + this.z * m.a32;
        var z = this.x * m.a13 + this.y * m.a23 + this.z * m.a33;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
}