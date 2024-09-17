import {Vec3} from "./vec3.js"
import {Plane} from "./plane.js"
import {Face} from "./face.js"
import {epsilon} from "./epsilon.js"

export class ConvexPolyhedron {
    constructor(gl, positions){
        this.positions = positions;
        this.faces = [];
        for (var i = 0; i < positions.length; i++){
            for (var j = i+1; j < positions.length; j++){
                for (var k = j+1; k < positions.length; k++){
                    this.process_triangle(
                        positions[i],
                        positions[j],
                        positions[k]
                    );
                }
            }
        }

        var tris = [];
        for (var i = 0; i < this.faces.length; i++){
            var indices = this.faces[i].indices;
            var center = new Vec3(0.0,0.0,0.0);
            for (var j = 0; j < indices.length; j++){
                center.add(this.positions[indices[j]]);
            }
            center.scale(1.0 / indices.length);
            for (var j = 0; j < indices.length; j++){
                var k = (j + 1) % indices.length;
                var a = this.positions[indices[j]];
                var b = this.positions[indices[k]];
                tris.push([center.x,center.y,center.z,1.0,0.0,0.0]);
                tris.push([a.x,a.y,a.z,0.0,1.0,0.0]);
                tris.push([b.x,b.y,b.z,0.0,0.0,1.0]);
            }
        }
        this.tri_vcount = tris.length;
        this.tri_vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tri_vbo);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tris.flat()),gl.STATIC_DRAW);
    }

    extreme(indices, plane, coplanar){
        var front = false;
        var back = false;
        for (var i = 0; i < indices.length; i++){
            var d = plane.distance_to(this.positions[indices[i]]);
            if (d > epsilon){
                front = true;
                if (front && back){
                    return 0;
                }
            } else if (d < -epsilon){
                back = true
                if (front && back){
                    return 0;
                }
            } else {
                coplanar.push(indices[i]);
            }
        }
        return front ? 1 : -1;
    }

    furthest(indices, ray){
        var furthest_i = 0;
        var furthest_d = 0.0;
        for (var i = 0; i < indices.length; i++){
            var d = ray.dot(this.positions[indices[i]]);
            if (d > furthest_d){
                furthest_d = d;
                furthest_i = indices[i];
            }
        }
        return furthest_i;
    }
    
    process_triangle(a,b,c){
        var plane = Plane.from_triangle(a,b,c);
        if (plane == null) return;
        var coplanar = [];
        switch (this.extreme([...this.positions.keys()], plane, coplanar)){
            case 0: return;
            case 1: plane.flip();
        }
        for (var i = 0; i < this.faces.length; i++)
            if (plane.normal.equal(this.faces[i].plane.normal))
                return;
        var indices = [];
        var i0 = this.furthest(coplanar,b.from_sub(a));
        var p0 = this.positions[i0];
        var iter = 0;
        while (true){
            for (var i = 0; i < coplanar.length; i++){
                var i1 = coplanar[i];
                if (i0 == i1) continue;
                var p1 = this.positions[i1];
                var line = p1.from_sub(p0);
                var line_plane = Plane.from_perpendicular(p0,line,plane.normal);
                var colinear = [];
                if (this.extreme(coplanar, line_plane, colinear) != -1)
                    continue;
                i1 = this.furthest(colinear,line);
                if (indices.length && i1 == indices[0]){
                    this.faces.push(new Face(plane, indices));
                    return;
                }
                indices.push(i1);
                i0 = i1;
                p0 = this.positions[i1];
            }
            iter++;
            if (iter >= 50) break;
        }
    }

    log_faces(){
        for (var i = 0; i < this.faces.length; i++){
            var face = this.faces[i];
            var plane = face.plane;
            var str = 
                   "Face " + i + ":\n";
            str += "  Plane:\n";
            str += "    Normal: " + plane.normal.x + ", " + plane.normal.y + ", " + plane.normal.z + "\n";
            str += "    Distance: " + plane.distance + "\n";
            str += "  Positions:\n";
            for (var j = 0; j < face.indices.length; j++){
                var pos = this.positions[face.indices[j]];
                str += "    " + pos.x + ", " + pos.y + ", " + pos.z + "\n";
            }
            console.log(str);
        }
    }

    raycast(origin, ray){
        //if no hit, return null
        //else return plane

    }
}