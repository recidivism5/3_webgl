import { Vec3 } from "./vec3.js"

export class AABB {
    constructor(){
        this.min = new Vec3();
        this.max = new Vec3();
    }

    copy(aabb){
        this.min.copy(aabb.min);
        this.max.copy(aabb.max);
    }

    expand(v){
        if (v.x > 0) this.max.x += v.x;
        else if (v.x < 0) this.min.x += v.x;

        if (v.y > 0) this.max.y += v.y;
        else if (v.y < 0) this.min.y += v.y;

        if (v.z > 0) this.max.z += v.z;
        else if (v.z < 0) this.min.z += v.z;
    }

    overlaps(aabb){
        return this.min.x < aabb.max.x &&
               this.max.x > aabb.min.x &&
               this.min.y < aabb.max.y &&
               this.max.y > aabb.min.y &&
               this.min.z < aabb.max.z &&
               this.max.z > aabb.min.z;
    }
}