import {Vec3} from "./vec3.js"

export class Plane {
    constructor(normal, distance){
        this.normal = normal;
        this.distance = distance;
    }

    static from_triangle(a,b,c){
        var n = b.from_sub(a).cross(c.from_sub(a));
        if (n.is_zero()) return null;
        n.normalize();
        return new Plane(n, n.dot(a));
    }

    static from_perpendicular(a,ab,normal){
        var n = ab.from_cross(normal).normalize();
        return new Plane(n,n.dot(a));
    }

    distance_to(point){
        return this.normal.dot(point) - this.distance;
    }

    flip(){
        this.normal.negate();
        this.distance *= -1;
    }
}