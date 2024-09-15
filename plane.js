import * as Vec3 from "./vec3.js"
import {epsilon} from "./epsilon.js"

export class Plane {
    constructor(normal, distance){
        this.normal = normal;
        this.distance = distance;
    }

    static from_triangle(a,b,c){
        var ab = Vec3.create();
        var ac = Vec3.create();
        Vec3.sub(ab,b,a);
        Vec3.sub(ac,c,a);
        var normal = Vec3.create();
        Vec3.cross(normal,ab,ac);
        Vec3.normalize(normal,normal);
        var distance = Vec3.dot(normal,a);
        return new Plane(normal, distance);
    }

    static from_perpendicular(a,b,normal){
        var ab = Vec3.create();
        Vec3.sub(ab,b,a);
        var n = Vec3.create();
        Vec3.cross(n,ab,normal);
        Vec3.normalize(n,n);
        var d = Vec3.dot(n,a);
        return new Plane(n,d);
    }

    distance_to(point){
        return Vec3.dot(this.normal,point) - this.distance;
    }

    classify(point, front, coplanar, back, element){
        var d = this.distance_to(point);
        if (d > epsilon) front.push(element);
        else if (d < -epsilon) back.push(element);
        else coplanar.push(element);
    }

    flip(){
        Vec3.negate(this.normal,this.normal);
        this.distance *= -1;
    }
}