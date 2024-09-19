import {Vec3} from "./vec3.js"
import {Face} from "./face.js"
import {Plane} from "./plane.js"
import {epsilon} from "./epsilon.js"

export var blocktypes = [];

export class HullPoint {
    constructor(position){
        this.position = position;
        this.facecount = 0;
    }
};

function get_bitmap(positions){
    var bitmap = 0;
    for (var i = 0; i < positions.length; i++){
        var p = positions[i];
        bitmap |= 1<<(p.z*3*3 + p.y*3 + p.x);
    }
    return bitmap;
}

export class Shape {
    constructor(positions, bitmap){
        this.hullpoints = [];
        this.bitmap = bitmap;
        for (var i = 0; i < positions.length; i++){
            var p = positions[i];
            this.hullpoints.push(new HullPoint(p));
        }
        this.hull = [];
        this.border_bitmaps = [];
        this.build_hull();
        this.tri_vbo = null;
        this.tri_vcount = null;
        this.build_tris(gl);
    }

    get_bitmap_from_indices(indices){
        var bitmap = 0;
        for (var i = 0; i < indices.length; i++){
            var p = this.hullpoints[indices[i]].position;
            bitmap |= 1<<(p.z*3*3 + p.y*3 + p.x);
        }
    }

    build_tris(gl){
        var tris = [];
        for (var i = 0; i < this.hull.length; i++){
            var face = this.hull[i];
            if (face.indices.length == 3){
                for (var j = 0; j < face.indices.length; j++){
                    var p = this.hullpoints[face.indices[j]].position;
                    var v = [
                        p.x,p.y,p.z,
                        0,0,0
                    ];
                    v[3+j] = 3;
                    tris.push(v);
                }
            } else {
                var center = new Vec3(0,0,0);
                for (var j = 0; j < face.indices.length; j++){
                    var p = this.hullpoints[face.indices[j]].position;
                    center.add(p);
                }
                center.scale(1.0 / face.indices.length);
                for (var j = 0; j < face.indices.length; j++){
                    var p0 = this.hullpoints[face.indices[j]].position;
                    var p1 = this.hullpoints[face.indices[(j+1)%face.indices.length]].position;
                    tris.push([
                        center.x,center.y,center.z, 1,0,0
                    ]);
                    tris.push([
                        p0.x,p0.y,p0.z, 0,1,0
                    ]);
                    tris.push([
                        p1.x,p1.y,p1.z, 0,0,1
                    ]);
                }
            }
        }
        this.tri_vcount = tris.length;
        this.tri_vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,this.tri_vbo);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tris.flat()),gl.STATIC_DRAW);
    }

    get_coplanar(plane){
        var coplanar = [];
        for (var i = 0; i < this.hullpoints.length; i++){
            var p = this.hullpoints[i].position;
            var d = plane.distance_to(p);
            if (Math.abs(d) <= epsilon){
                coplanar.push(i);
            }
        }
        return coplanar;
    }

    add_face(plane, coplanar){
        if (coplanar.length < 3) return;
        var indices = [coplanar.pop()];
        while (coplanar.length){
            var a = this.hullpoints[indices[indices.length-1]].position;
            for (var i = 0; i < coplanar.length; i++){
                var b = this.hullpoints[coplanar[i]].position;
                var ab = b.from_sub(a);
                var abplane = Plane.from_perpendicular(a,ab,plane.normal);
                var extreme = true;
                for (var j = 0; j < coplanar.length; j++){
                    if (i == j) continue;
                    var p = this.hullpoints[coplanar[j]].position;
                    if (abplane.distance_to(p) > epsilon){
                        extreme = false;
                        break;
                    }
                }
                if (!extreme) continue;
                indices.push(coplanar[i]);
                coplanar.splice(i,1);
            }
        }
        for (var i = 0; i < indices.length; i++){
            this.hullpoints[indices[i]].facecount++;
        }
        this.hull.push(new Face(plane,indices));
    }

    add_face_from_normal(normal){
        var furthest_d = -999.0;
        for (var i = 0; i < this.hullpoints.length; i++){
            var p = this.hullpoints[i].position;
            var d = normal.dot(p);
            if (d > furthest_d){
                furthest_d = d;
            }
        }
        var plane = new Plane(normal, furthest_d);
        var coplanar = this.get_coplanar(plane);
        this.border_bitmaps.push(this.get_bitmap_from_indices(coplanar));
        this.add_face(plane, coplanar);
    }

    build_hull(){
        this.add_face_from_normal(new Vec3(-1,0,0));
        this.add_face_from_normal(new Vec3(1,0,0));
        this.add_face_from_normal(new Vec3(0,-1,0));
        this.add_face_from_normal(new Vec3(0,1,0));
        this.add_face_from_normal(new Vec3(0,0,-1));
        this.add_face_from_normal(new Vec3(0,0,1));
        var remaining = [];
        var other = null;
        for (var i = 0; i < this.hullpoints.length; i++){
            var p = this.hullpoints[i];
            if (p.facecount < 3){
                remaining.push(i);
            } else if (other == null){
                other = p.position;
            }
        }
        if (!remaining.length) return;
        var plane = Plane.from_triangle(
            this.hullpoints[remaining[0]].position,
            this.hullpoints[remaining[1]].position,
            this.hullpoints[remaining[2]].position
        );
        if (plane.distance_to(other) > epsilon)
            plane.flip();
        this.add_face(plane,remaining);
    }

    log_bitmap(){
        var s = "";
        for (var i = 0; i < 32; i++){
            s += (this.bitmap & (1<<i)) ? '1' : '0';
        }
        console.log(s);
    }
}

function gen(positions){
    for (var x = 0; x < 4; x++){
        for (var y = 0; y < 4; y++){
            for (var z = 0; z < 4; z++){
                var points = [];
                for (var i = 0; i < positions.length; i++){
                    var v = positions[i].clone();
                    v.sub(new Vec3(1,1,1));
                    v.rotate_x(x*90.0);
                    v.rotate_y(y*90.0);
                    v.rotate_z(z*90.0);
                    v.add(new Vec3(1,1,1));
                    v.round();
                    points.push(v);
                }
                var bitmap = get_bitmap(points);
                var rotation_exists = false;
                for (var i = 0; i < blocktypes.length; i++){
                    if (blocktypes[i].bitmap == bitmap){
                        rotation_exists = true;
                        break;
                    }
                }
                if (rotation_exists) continue;
                blocktypes.push(new Shape(points, bitmap));
            }
        }
    }
}

export function init(){
    gen([ // cube
        new Vec3(0,0,0),
        new Vec3(2,0,0),
        new Vec3(2,2,0),
        new Vec3(0,2,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(2,2,2),
        new Vec3(0,2,2),
    ]);

    gen([ // 45 wedge
        new Vec3(0,0,0),
        new Vec3(2,0,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(2,2,2),
        new Vec3(0,2,2),
    ]);

    gen([ // 45 corner
        new Vec3(0,0,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(0,2,2),
    ]);

    gen([ // low wedge
        new Vec3(0,0,0),
        new Vec3(2,0,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(2,1,2),
        new Vec3(0,1,2),
    ]);

    gen([ // high wedge
        new Vec3(0,0,0),
        new Vec3(2,0,0),
        new Vec3(2,1,0),
        new Vec3(0,1,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(2,2,2),
        new Vec3(0,2,2),
    ]);

    gen([ // low corner
        new Vec3(0,0,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(0,1,2),
    ]);

    gen([ // high corner
        new Vec3(0,0,0),
        new Vec3(2,0,0),
        new Vec3(0,1,0),

        new Vec3(0,0,2),
        new Vec3(2,0,2),
        new Vec3(0,2,2),
        new Vec3(2,1,2),
    ]);
}