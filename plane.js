import {Vec3} from "./vec3.js"
import {EPSILON} from "./epsilon.js"

export class Plane {
    constructor(normal, distance){
        this.normal = normal;
        this.distance = distance;
    }

    static from_triangle(a,b,c){
        var n = b.clone().sub(a).cross(c.clone().sub(a));
        if (n.is_zero()) return null;
        n.normalize();
        return new Plane(n, n.dot(a));
    }

    static from_perpendicular(a,ab,normal){
        var n = ab.clone().cross(normal).normalize();
        return new Plane(n,n.dot(a));
    }

    equal(plane){
        return this.normal.equal(plane.normal) && 
               Math.abs(this.distance - plane.distance) <= EPSILON;
    }

    distance_to(point){
        return this.normal.dot(point) - this.distance;
    }

    point_is_on(point){
        return Math.abs(this.distance_to(point)) <= EPSILON;
    }

    flip(){
        this.normal.negate();
        this.distance *= -1;
    }
}