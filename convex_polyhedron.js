import * as Vec3 from "./vec3.js"
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
        if (Vec3.equal(plane.normal,faces[i].plane.normal)){
            found = true;
            break;
        }
    }
    if (found) return;
    var remaining = [];
    for (var i = 0; i < coplanar.length; i++){
        remaining.push(coplanar[i]);
    }
    var indices = [remaining.pop()];
    var iterations = 0;
    while (remaining.length){
        var cur = positions[indices[indices.length-1]];
        var found = false;
        for (var i = 0; i < remaining.length; i++){
            var next = positions[remaining[i]];
            var cp = Plane.from_perpendicular(next,cur,plane.normal);
            var extreme = true;
            for (var m = 0; m < coplanar.length; m++){
                var mp = positions[coplanar[m]];
                var md = cp.distance_to(mp);
                if (md < -epsilon){
                    extreme = false;
                    break;
                }
                if (Math.abs(md) < epsilon){
                    /*

                        instead we should just classify the points
                        like above. pick the furthest colinear
                        point and remove the nearer ones.
                    */
                }
            }
            if (!extreme) continue;
            indices.push(remaining[i]);
            remaining.splice(i,1);
            found = true;
            break;
        }
        if (!found){
            console.error("improper polygon");
            return;
        }
    }
    faces.push(new Face(plane, indices));
}

export class ConvexPolyhedron {
    constructor(gl, positions){
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
        var tesselated = [];
        for (var i = 0; i < this.faces.length; i++){
            var indices = this.faces[i].indices;
            var center = Vec3.create();
            for (var j = 0; j < indices.length; j++){
                Vec3.add(center,center,this.positions[indices[j]]);
            }
            Vec3.scale(center,center,1.0 / indices.length);
            for (var j = 0; j < indices.length; j++){
                var k = (j + 1) % indices.length;
                var a = this.positions[indices[j]];
                var b = this.positions[indices[k]];
                tesselated.push([center[0],center[1],center[2],1.0,0.0,0.0]);
                tesselated.push([a[0],a[1],a[2],0.0,1.0,0.0]);
                tesselated.push([b[0],b[1],b[2],0.0,0.0,1.0]);
            }
        }
        this.n_vertices = tesselated.length;
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tesselated.flat()),gl.STATIC_DRAW);
    }

    log_faces(){
        for (var i = 0; i < this.faces.length; i++){
            var face = this.faces[i];
            var plane = face.plane;
            var str = 
                   "Face " + i + ":\n";
            str += "  Plane:\n";
            str += "    Normal: " + plane.normal[0] + ", " + plane.normal[1] + ", " + plane.normal[2] + "\n";
            str += "    Distance: " + plane.distance + "\n";
            str += "  Positions:\n";
            for (var j = 0; j < face.indices.length; j++){
                var pos = this.positions[face.indices[j]];
                str += "    " + pos[0] + ", " + pos[1] + ", " + pos[2] + "\n";
            }
            console.log(str);
        }
    }

    raycast(origin, ray){
        //if no hit, return null
        //else return plane

    }
}