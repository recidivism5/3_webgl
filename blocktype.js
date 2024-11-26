import {Vec3} from "./vec3.js"
import {Plane} from "./plane.js"
import {EPSILON} from "./epsilon.js"
import * as Graphics from "./graphics.js"
import * as random from "./random.js"

function get_bitmap(positions){
    var bitmap = 0;
    for (var i = 0; i < positions.length; i++){
        var p = positions[i];
        bitmap |= 1<<(p.z*3*3 + p.y*3 + p.x);
    }
    return bitmap;
}

class ExpandedPosition {
    constructor(parent, offset){
        this.parent = parent;
        this.offset = offset;
    }
}

export var base_type_ids = [];
export var types = [];
var bitmap_to_type = new Map();

function get_brightness(normal){
    return Math.min(1,Math.max(
        0,
        normal.dot(Graphics.light_vec0),
        normal.dot(Graphics.light_vec1)
    )*(1-Graphics.ambient) + Graphics.ambient);
}

var border_brightnesses = [];

export function get_random_id(){
    return random.rand_int(types.length);
}

export function iterate_borders(func){
    var index = 0;
    for (var component = 0; component < 3; component++){
        for (var direction = -1; direction <= 1; direction += 2){
            var normal = new Vec3(0,0,0);
            normal.set_component(component,direction);
            var plane = new Plane(normal,direction == 1 ? 1 : 0);
            func(component, direction, index, plane);
            index++;
        }
    }
}

export class BlockType {
    constructor(id, positions, bitmap, faces, expanded_positions, expanded_faces){
        this.id = id;
        this.positions = positions;
        this.original_positions_length = this.positions.length;
        this.bitmap = bitmap;
        bitmap_to_type.set(bitmap,this);
        this.faces = faces;
        this.expanded_positions = expanded_positions;
        this.expanded_faces = expanded_faces;

        this.positions.forEach((p)=>{
            p.scale(0.5);
        });

        this.planes = [];
        this.brightnesses = [];
        this.faces.forEach((face)=>{
            var plane = Plane.from_triangle(
                this.positions[face[0]],
                this.positions[face[1]],
                this.positions[face[2]],
            );
            this.planes.push(plane);
            
            this.brightnesses.push(
                get_brightness(plane.normal)
            );
        });

        this.wire_positions = [];
        this.position_normals = [];
        this.unique_edges = [];
        this.faces.forEach((face, face_id)=>{
            face.forEach((pos_id)=>{
                if (this.position_normals[pos_id] == undefined){
                    this.position_normals[pos_id] = [];
                }
                this.position_normals[pos_id].push(this.planes[face_id].normal);
            });
            for (var i = 0; i < face.length; i++){
                var j = (i + 1) % face.length;
                var edgef = [face[i],face[j]];
                var edger = [face[j],face[i]];
                var found = false;
                for (var k = 0; k < this.unique_edges.length; k++){
                    var edge = this.unique_edges[k];
                    if (
                        (edge[0] == edgef[0] && edge[1] == edgef[1]) ||
                        (edge[0] == edger[0] && edge[1] == edger[1])
                    ){
                        found = true;
                        break;
                    }
                }
                if (found) continue;
                this.unique_edges.push(edgef);
            }
        });
        this.position_normals.forEach((normals, pos_id)=>{
            var sum = new Vec3(0,0,0);
            normals.forEach((normal)=>{
                sum.add(normal);
            });
            sum.normalize();
            sum.scale(0.005);
            sum.add(this.positions[pos_id]);
            this.wire_positions.push(sum);
        });

        this.border_face_ids = [];
        iterate_borders((component, direction, index, plane)=>{
            var found = false;
            for (var i = 0; i < this.planes.length; i++){
                if (this.planes[i].equal(plane)){
                    this.border_face_ids.push(i);
                    found = true;
                    break;
                }
            }
            if (!found){
                this.border_face_ids.push(-1);
            }
        });

        this.non_border_face_ids = [];
        for (var i = 0; i < this.faces.length; i++){
            if (!this.border_face_ids.includes(i)){
                this.non_border_face_ids.push(i);
            }
        }

        this.clipped_faces = [[],[],[],[],[],[]];
    }

    clip_face(normal, a, neighbor, b){
        if (b == null || b.length == 0){
            if (a.length == 0) return null;
            return a;
        }
        //find line that crosses through square
        var b0 = null;
        var b1 = null;
        for (var i = 0; i < b.length; i++){
            var j = (i + 1) % b.length;
            var ii = b[i];
            var ji = b[j];
            var ip = neighbor.positions[ii];
            var jp = neighbor.positions[ji];
            if (
                (ip.x != jp.x && ip.y != jp.y) ||
                (ip.x != jp.x && ip.z != jp.z) ||
                (ip.y != jp.y && ip.z != jp.z) ||
                (ip.x != 0 && ip.x != 1 && jp.x != 0 && jp.x != 1) ||
                (ip.y != 0 && ip.y != 1 && jp.y != 0 && jp.y != 1) ||
                (ip.z != 0 && ip.z != 1 && jp.z != 0 && jp.z != 1)
            ){
                b0 = ip;
                b1 = jp;
                break;
            }
        }
        if (b0 == null){
            return null;
        }
        var bvec = b1.clone().sub(b0);
        var plane = Plane.from_perpendicular(b0,bvec,normal);
        for (var i = 0; i < b.length; i++){
            if (plane.distance_to(neighbor.positions[b[i]]) > EPSILON){
                plane.flip();
                break;
            }
        }
        var clipped = [];
        for (var i = 0; i < a.length; i++){
            var j = (i + 1) % a.length;
            var ii = a[i];
            var ji = a[j];
            var ip = this.positions[ii];
            var jp = this.positions[ji];
            var id = plane.distance_to(ip);
            var jd = plane.distance_to(jp);
            
            if (id >= -EPSILON){
                clipped.push(ii);
            }
            if (
                (id > EPSILON && jd < -EPSILON) ||
                (id < -EPSILON && jd > EPSILON)
            ){
                var total = Math.abs(id) + Math.abs(jd);
                var t = Math.abs(id) / total;
                var lp = ip.clone();
                lp.lerp(jp,t);
                var found = -1;
                for (var k = this.original_positions_length; k < this.positions.length; k++){
                    if (this.positions[k].equal(lp)){
                        found = k;
                        break;
                    }
                }
                if (found < 0){
                    this.positions.push(lp);
                    found = this.positions.length-1;
                }
                clipped.push(found);
            }
        }
        if (clipped.length < 3) clipped = null;
        return clipped;
    }

    get_border_face(border_id){
        var face_id = this.border_face_ids[border_id];
        if (face_id < 0) return null;
        return this.faces[face_id];
    }

    build_clipped_faces(){
        const inv = [1,0,3,2,5,4];
        iterate_borders((component, direction, index, plane)=>{
            var face = this.get_border_face(index);
            if (face != null){
                types.forEach((type)=>{
                    var neighbor_face = type.get_border_face(inv[index]);
                    this.clipped_faces[index].push(
                        this.clip_face(plane.normal,face,type,neighbor_face)
                    );
                });
            }
        });
    }

    static texcoords = [[0,1],[0,0],[1,0],[1,0],[1,1],[0,1]];

    draw_face(x, y, z, face, brightness, color){
        Graphics.color(
            brightness * color.r,
            brightness * color.g,
            brightness * color.b,
            color.a
        );
        switch (face.length){
            case 3:
                for (var i = 0; i < face.length; i++){
                    var pos = this.positions[face[i]];
                    Graphics.position(
                        x + pos.x,
                        y + pos.y,
                        z + pos.z
                    );
                }
                break;
            case 4:
                for (var i = 0; i < BlockType.quad_indices.length; i++){
                    var tc = BlockType.texcoords[i];
                    Graphics.texcoord(tc[0],tc[1]);
                    var pos = this.positions[face[BlockType.quad_indices[i]]];
                    Graphics.position(
                        x + pos.x,
                        y + pos.y,
                        z + pos.z
                    );
                }
                break;
        }
    }

    draw(color){
        this.faces.forEach((face, face_id)=>{
            var brightness = this.brightnesses[face_id];
            this.draw_face(0, 0, 0, face, brightness, color);
        });
    }

    static uv_free_axes = [
        [1,2],
        [0,2],
        [0,1]
    ];

    static quad_indices = [0,1,2,2,3,0];

    draw_clipped_face(x, y, z, component, index, neighbor_id, color){
        var face = this.clipped_faces[index][neighbor_id];
        if (face == null) return;
        var brightness = border_brightnesses[index];
        Graphics.color(
            brightness * color.r,
            brightness * color.g,
            brightness * color.b,
            color.a
        );
        var fa = BlockType.uv_free_axes[component];
        switch (face.length){
            case 3:
                for (var i = 0; i < face.length; i++){
                    var pos = this.positions[face[i]];
                    Graphics.texcoord(
                        pos.get_component(fa[0]),
                        pos.get_component(fa[1]),
                    );
                    Graphics.position(
                        x + pos.x,
                        y + pos.y,
                        z + pos.z
                    );
                }
                break;
            case 4:
                for (var i = 0; i < BlockType.quad_indices.length; i++){
                    var pos = this.positions[face[BlockType.quad_indices[i]]];
                    Graphics.texcoord(
                        pos.get_component(fa[0]),
                        pos.get_component(fa[1]),
                    );
                    Graphics.position(
                        x + pos.x,
                        y + pos.y,
                        z + pos.z
                    );
                }
                break;
        }
    }

    draw_non_border_faces(x, y, z, color){
        this.non_border_face_ids.forEach((face_id)=>{
            var face = this.faces[face_id];
            var brightness = this.brightnesses[face_id];
            this.draw_face(x, y, z, face, brightness, color);
        });
    }

    draw_wireframe(x, y, z){
        Graphics.push();
            Graphics.translate(x, y, z);
            Graphics.begin_lines();
            Graphics.color(0,0,0,255);
            this.unique_edges.forEach((edge)=>{
                edge.forEach((pos_id)=>{
                    var pos = this.wire_positions[pos_id];
                    Graphics.position(
                        pos.x,
                        pos.y,
                        pos.z
                    );
                });
            });
            Graphics.end();
        Graphics.pop();
    }
}

function add_type(positions, faces, expanded_positions, expanded_faces){
    for (var z = 0; z < 4; z++){
        for (var x = 0; x < 4; x++){
            for (var y = 0; y < 4; y++){
                var rotated_positions = [];
                for (var i = 0; i < positions.length; i++){
                    var pos = positions[i].clone();
                    pos.subc(1, 1, 1);
                    pos.rotate_x(x * 90);
                    pos.rotate_y(y * 90);
                    pos.rotate_z(z * 90);
                    pos.addc(1, 1, 1);
                    pos.round();
                    rotated_positions.push(pos);
                }
                var bitmap = get_bitmap(rotated_positions);
                if (get_by_bitmap(bitmap) != null) continue;
                var rotated_expanded_positions = [];
                for (var i = 0; i < expanded_positions.length; i++){
                    var ep = expanded_positions[i];
                    var offset = ep.offset.clone();
                    offset.rotate_x(x * 90);
                    offset.rotate_y(y * 90);
                    offset.rotate_z(z * 90);
                    offset.round();
                    rotated_expanded_positions.push(
                        new ExpandedPosition(
                            ep.parent,
                            offset
                        )
                    );
                }
                push_type(
                    rotated_positions,
                    bitmap,
                    faces,
                    rotated_expanded_positions,
                    expanded_faces
                );
                if (x == 0 && y == 0 && z == 0){
                    base_type_ids.push(
                        types.length-1
                    );
                }
            }
        }
    }
}

function get_by_bitmap(bitmap){
    return bitmap_to_type.get(bitmap);
}

function push_type(positions, bitmap, faces, expanded_positions, expanded_faces){
    types.push(new BlockType(
        types.length,
        positions,
        bitmap,
        faces,
        expanded_positions,
        expanded_faces
    ));
}

export function init(){

    iterate_borders((component, direction, index, plane)=>{
        border_brightnesses.push(get_brightness(plane.normal))
    });

    push_type([],0,[],[],[]); // air

    base_type_ids.push(
        types.length-1
    );

    add_type( // cube
        [ //positions
            new Vec3(0,0,0),
            new Vec3(2,0,0),
            new Vec3(2,2,0),
            new Vec3(0,2,0),

            new Vec3(0,0,2),
            new Vec3(2,0,2),
            new Vec3(2,2,2),
            new Vec3(0,2,2),
        ],
        [ //faces
            [2,1,0,3],
            [7,4,5,6],
            [4,0,1,5],
            [3,7,6,2],
            [3,0,4,7],
            [6,5,1,2],
        ],
        [ //expanded positions
            new ExpandedPosition(0, new Vec3(-1,-1,-1)),
            new ExpandedPosition(1, new Vec3(+1,-1,-1)),
            new ExpandedPosition(2, new Vec3(+1,+1,-1)),
            new ExpandedPosition(3, new Vec3(-1,+1,-1)),

            new ExpandedPosition(4, new Vec3(-1,-1,+1)),
            new ExpandedPosition(5, new Vec3(+1,-1,+1)),
            new ExpandedPosition(6, new Vec3(+1,+1,+1)),
            new ExpandedPosition(7, new Vec3(-1,+1,+1)),
        ],
        [ //expanded faces
            [2,1,0,3],
            [7,4,5,6],
            [4,0,1,5],
            [3,7,6,2],
            [3,0,4,7],
            [6,5,1,2],
        ]
    );

    add_type( // slab
        [ //positions
            new Vec3(0,0,0),
            new Vec3(2,0,0),
            new Vec3(2,1,0),
            new Vec3(0,1,0),

            new Vec3(0,0,2),
            new Vec3(2,0,2),
            new Vec3(2,1,2),
            new Vec3(0,1,2),
        ],
        [ //faces
            [2,1,0,3],
            [7,4,5,6],
            [4,0,1,5],
            [3,7,6,2],
            [3,0,4,7],
            [6,5,1,2],
        ],
        [ //expanded positions
            new ExpandedPosition(0, new Vec3(-1,-1,-1)),
            new ExpandedPosition(1, new Vec3(+1,-1,-1)),
            new ExpandedPosition(2, new Vec3(+1,+1,-1)),
            new ExpandedPosition(3, new Vec3(-1,+1,-1)),

            new ExpandedPosition(4, new Vec3(-1,-1,+1)),
            new ExpandedPosition(5, new Vec3(+1,-1,+1)),
            new ExpandedPosition(6, new Vec3(+1,+1,+1)),
            new ExpandedPosition(7, new Vec3(-1,+1,+1)),
        ],
        [ //expanded faces
            [2,1,0,3],
            [7,4,5,6],
            [4,0,1,5],
            [3,7,6,2],
            [3,0,4,7],
            [6,5,1,2],
        ]
    );

    add_type(
        [ // 45 wedge
            new Vec3(0,0,0),
            new Vec3(2,0,0),
            new Vec3(2,2,0),

            new Vec3(0,0,2),
            new Vec3(2,0,2),
            new Vec3(2,2,2),
        ],
        [
            [2,1,0],
            [3,4,5],
            
            [3,0,1,4],
            [5,4,1,2],

            [0,3,5,2]
        ],
        [
            new ExpandedPosition(0, new Vec3(-1,+1,-1)),
            new ExpandedPosition(0, new Vec3(-1,-1,-1)),
            new ExpandedPosition(3, new Vec3(-1,-1,+1)),
            new ExpandedPosition(3, new Vec3(-1,+1,+1)),

            new ExpandedPosition(2, new Vec3(+1,+1,-1)),
            new ExpandedPosition(2, new Vec3(-1,+1,-1)),
            new ExpandedPosition(5, new Vec3(-1,+1,+1)),
            new ExpandedPosition(5, new Vec3(+1,+1,+1)),

            new ExpandedPosition(1, new Vec3(+1,-1,-1)),
            new ExpandedPosition(4, new Vec3(+1,-1,+1))
        ],
        [
            [0,1,2,3],
            [4,5,6,7],

            [0,3,6,5],

            [4,8,1,0,5],
            [3,2,9,7,6],

            [2,1,8,9],
            [7,9,8,4]
        ]
    );

    add_type(
        [ // 45 corner
            new Vec3(0,2,0),
            new Vec3(0,0,0),
            new Vec3(0,0,2),
            new Vec3(2,0,0),
        ],
        [
            [0,1,2],
            [0,3,1],
            [2,1,3],
            [0,2,3]
        ],
        [
            new ExpandedPosition(0, new Vec3(-1,+1,-1)),
            new ExpandedPosition(0, new Vec3(-1,+1,+1)),
            new ExpandedPosition(0, new Vec3(+1,+1,+1)),
            new ExpandedPosition(0, new Vec3(+1,+1,-1)),

            new ExpandedPosition(2, new Vec3(-1,+1,+1)),
            new ExpandedPosition(2, new Vec3(-1,-1,+1)),
            new ExpandedPosition(2, new Vec3(+1,-1,+1)),
            new ExpandedPosition(2, new Vec3(+1,+1,+1)),

            new ExpandedPosition(3, new Vec3(+1,+1,+1)),
            new ExpandedPosition(3, new Vec3(+1,-1,+1)),
            new ExpandedPosition(3, new Vec3(+1,-1,-1)),
            new ExpandedPosition(3, new Vec3(+1,+1,-1)),

            new ExpandedPosition(1, new Vec3(-1,-1,-1)),
        ],
        [
            [0,1,2,3],
            [4,5,6,7],
            [8,9,10,11],

            [1,4,7,2],
            [6,9,8,7],
            [2,8,11,3],

            [2,7,8],

            [0,12,5,4,1],
            [3,11,10,12,0],
            [5,12,10,9,6],
        ]
    );

    add_type(
        [ // low wedge
            new Vec3(0,0,0),
            new Vec3(2,0,0),
            new Vec3(2,1,0),

            new Vec3(0,0,2),
            new Vec3(2,0,2),
            new Vec3(2,1,2),
        ],
        [
            [2,1,0],
            [3,4,5],
            
            [3,0,1,4],
            [5,4,1,2],

            [0,3,5,2]
        ],
        [
            new ExpandedPosition(0, new Vec3(-1,+1,-1)),
            new ExpandedPosition(0, new Vec3(-1,-1,-1)),
            new ExpandedPosition(3, new Vec3(-1,-1,+1)),
            new ExpandedPosition(3, new Vec3(-1,+1,+1)),

            new ExpandedPosition(2, new Vec3(+1,+1,-1)),
            new ExpandedPosition(2, new Vec3(-1,+1,-1)),
            new ExpandedPosition(5, new Vec3(-1,+1,+1)),
            new ExpandedPosition(5, new Vec3(+1,+1,+1)),

            new ExpandedPosition(1, new Vec3(+1,-1,-1)),
            new ExpandedPosition(4, new Vec3(+1,-1,+1))
        ],
        [
            [0,1,2,3],
            [4,5,6,7],

            [0,3,6,5],

            [4,8,1,0,5],
            [3,2,9,7,6],

            [2,1,8,9],
            [7,9,8,4]
        ]
    );
    /*
    gen([ // high wedge
        [0,0,0],
        [2,0,0],
        [2,1,0],
        [0,1,0],
        [0,0,2],
        [2,0,2],
        [2,2,2],
        [0,2,2],
    ]);

    gen([ // low corner
        [0,0,0],
        [0,0,2],
        [2,0,2],
        [0,1,2],
    ]);

    gen([ // high corner
        [0,0,0],
        [2,0,0],
        [0,1,0],
        [0,0,2],
        [2,0,2],
        [0,2,2],
        [2,1,2],
    ]);
    */

    types.forEach((type)=>{
        type.build_clipped_faces();
    });
}

export function get(id){
    return types[id];
}