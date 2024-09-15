import {Vec3} from "./vec3.js"
import {epsilon} from "./epsilon.js"

export class Plane {
    constructor(normal, distance){
        this.normal = normal;
        this.distance = distance;
    }

    static from_triangle(a,b,c){
        var ab = b.sub(a);
        var ac = c.sub(a);
        var normal = ab.cross(ac).normalize();
        var distance = normal.dot(a);
        return new Plane(normal, distance);
    }

    static from_perpendicular(a,b){
        var normal = a.cross(b).normalize();
        var distance = a.dot(normal);
        return new Plane(normal, distance);
    }

    distance_to(point){
        return this.normal.dot(point) - this.distance;
    }

    classify(point, front, coplanar, back, element){
        var d = this.distance_to(point);
        if (d > epsilon) front.push(element);
        else if (d < -epsilon) back.push(element);
        else coplanar.push(element);
    }

    flip(){
        this.normal.negate();
        this.distance *= -1;
    }
}