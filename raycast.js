import {World} from "./world.js"
import {Vec3} from "./vec3.js"

export class Raycast {
    static cubes(origin, direction){
        //hit cube pos, null if none hit
        //hit cube normal
        var block_pos = origin.clone().floor();
        var increment = direction.clone().sign();
        var step = increment.clone().step();
        var recip_dir = direction.clone().abs().reciprocal();
        var ts = block_pos.clone().add(step).sub(origin).abs().mul(recip_dir);
        var t = 0;
        while (t <= 1){
            var block_id = World.get_block_id(block_pos.x, block_pos.y, block_pos.z);
            if (block_id > 0){
                return new Raycast(block_pos,null);
            }
            var min_t = Infinity;
            var min_i = 0;
            for (var i = 0; i < 3; i++){
                var tc = ts.get_component(i);
                if (tc < min_t){
                    min_t = tc;
                    min_i = i;
                }
            }
            t += min_t;
            ts.sub_scalar(min_t);
            ts.set_component(min_i, recip_dir.get_component(min_i));
            block_pos.add_component(min_i, increment.get_component(min_i));
        }
        return null;
    }

    constructor (position, normal){
        this.position = position;
        this.normal = normal;
    }
}