import {Vec3} from "./vec3.js"
import {Plane} from "./plane.js"
import {Face} from "./face.js"
import {epsilon} from "./epsilon.js"

function process_triangle(positions, faces, plane){
    var front = [];
    var coplanar = [];
    var back = [];
    for (var i = 0; i < positions.length; i++){
        plane.classify(positions[i],front,coplanar,back,i);
    }
    if (front.length && back.length) return;
    if (front.length > 0) plane.flip();
    var found = false;
    for (var i = 0; i < faces.length; i++){
        if (plane.normal.equal(faces[i].plane.normal)){
            found = true;
            break;
        }
    }
    if (found) return;
    var indices = [coplanar.pop()];
    while (coplanar.length){
        var cur = positions[indices[indices.length-1]];
        for (var i = 0; i < coplanar.length; i++){
            var next = positions[coplanar[i]];
            var cn = next.sub(cur);
            var cp = Plane.from_perpendicular(cn,plane.normal);
            var extreme = true;
            for (var m = 0; m < coplanar.length; m++){
                if (m == i) continue;
                var mp = positions[coplanar[m]];
                var md = cp.distance_to(mp);
                if (md < -epsilon){
                    extreme = false;
                    break;
                }
                if (Math.abs(md) < epsilon){
                    /*
                        m is colinear with cp.
                        So if m is closer to c than p,
                        use m instead
                    */
                }
            }
            if (!extreme) continue;
            indices.push(coplanar[i]);
            coplanar.splice(i,1);
            break;
        }
    }
    faces.push(new Face(plane, indices));
}

export class ConvexPolyhedron {
    constructor(positions){
        this.positions = positions;
        this.faces = [];
        for (var i = 0; i < positions.length; i++){
            for (var j = i+1; j < positions.length; j++){
                for (var k = j+1; k < positions.length; k++){
                    var plane = Plane.from_triangle(
                        positions[i],
                        positions[j],
                        positions[k]
                    );
                    process_triangle(
                        positions,
                        this.faces,
                        plane
                    );
                }
            }
        }
    }

    log_faces(){
        for (var i = 0; i < this.faces.length; i++){
            var face = this.faces[i];
            var str = "Face " + i + ":\n";
            for (var j = 0; j < face.indices.length; j++){
                var pos = this.positions[face.indices[j]];
                str += "\t" + pos.x + ", " + pos.y + ", " + pos.z + "\n";
            }
            console.log(str);
        }
    }

    raycast(origin, ray){
        //if no hit, return null
        //else return plane

    }
}