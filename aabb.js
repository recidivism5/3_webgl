export class AABB {
    constructor(min, max){
        this.min = min;
        this.max = max;
    }

    clone(){
        return new AABB(
            this.min.clone(),
            this.max.clone()
        );
    }

    expand(v){
        if (v.x > 0) this.max.x += v.x;
        else if (v.x < 0) this.min.x += v.x;

        if (v.y > 0) this.max.y += v.y;
        else if (v.y < 0) this.min.y += v.y;

        if (v.z > 0) this.max.z += v.z;
        else if (v.z < 0) this.min.z += v.z;
    }
}