import {Vec3} from "./vec3.js"
import {Plane} from "./plane.js"
import {EPSILON} from "./epsilon.js"
import {Immediate} from "./immediate.js"
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

export class BlockType {
    static base_types = [];
    static types = [];
    static bitmap_to_type = new Map();

    static ambient = 0.25;

    static light_vec0 = new Vec3(2,3,1).normalize();
    static light_vec1 = new Vec3(-2,3,-1).normalize();

    static get_brightness(normal){
        return Math.min(1,Math.max(
            0,
            normal.dot(BlockType.light_vec0),
            normal.dot(BlockType.light_vec1)
        )*(1-BlockType.ambient) + BlockType.ambient);
    }

    static border_brightnesses = [];

    static get_random_id(){
        return random.rand_int(BlockType.types.length);
    }

    constructor(id, positions, bitmap, faces, expanded_positions, expanded_faces){
        this.id = id;
        this.positions = positions;
        this.bitmap = bitmap;
        BlockType.bitmap_to_type.set(bitmap,this);
        this.faces = faces;
        this.expanded_positions = expanded_positions;
        this.expanded_faces = expanded_faces;

        this.positions.forEach((p)=>{
            p.scale(0.5);
        });

        this.triangulated_faces = [];
        this.faces.forEach((face)=>{
            var positions = [];
            face.forEach((pos_id)=>{
                positions.push(this.positions[pos_id]);
            });
            this.triangulated_faces.push(BlockType.triangulate(positions));
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
                BlockType.get_brightness(plane.normal)
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
        BlockType.iterate_borders((component, direction, index, plane)=>{
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

    static iterate_borders(func){
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

    static clip_face(normal, a, b){
        if (a.length == 4 && b.length == 3){
            Math.abs(0);
        }
        if (b.length == 0){
            return a;
        }
        //find line that crosses through square
        var b0 = null;
        var b1 = null;
        for (var i = 0; i < b.length; i++){
            var j = (i + 1) % b.length;
            var ip = b[i];
            var jp = b[j];
            if (
                (ip.x != jp.x && ip.y != jp.y) ||
                (ip.x != jp.x && ip.z != jp.z) ||
                (ip.y != jp.y && ip.z != jp.z)
            ){
                b0 = ip;
                b1 = jp;
                break;
            }
        }
        if (b0 == null){
            return [];
        }
        var bvec = b1.clone().sub(b0);
        var plane = Plane.from_perpendicular(b0,bvec,normal);
        for (var i = 0; i < b.length; i++){
            if (plane.distance_to(b[i]) > EPSILON){
                plane.flip();
                break;
            }
        }
        var clipped = [];
        for (var i = 0; i < a.length; i++){
            var j = (i + 1) % a.length;
            var ip = a[i];
            var jp = a[j];
            var id = plane.distance_to(ip);
            var jd = plane.distance_to(jp);
            
            if (id >= -EPSILON){
                clipped.push(ip.clone());
            }
            if (
                (id > EPSILON && jd < -EPSILON) ||
                (id < -EPSILON && jd > EPSILON)
            ){
                var total = Math.abs(id) + Math.abs(jd);
                var t = Math.abs(id) / total;
                var lp = ip.clone();
                lp.lerp(jp,t);
                clipped.push(lp);
            }
        }
        if (clipped.length < 3) clipped = [];
        return clipped;
    }

    static triangulate(face){
        switch (face.length){
            case 3: return face;
            case 4: return [face[0],face[1],face[2], face[2],face[3],face[0]];
            default: return null;
        }
    }

    get_border_face(border_id){
        var face = [];
        var face_id = this.border_face_ids[border_id];
        if (face_id < 0) return face;
        this.faces[face_id].forEach((index)=>{
            face.push(this.positions[index].clone());
        });
        return face;
    }

    build_clipped_faces(){
        const inv = [1,0,3,2,5,4];
        BlockType.iterate_borders((component, direction, index, plane)=>{
            var face = this.get_border_face(index);
            BlockType.types.forEach((type)=>{
                var neighbor_face = type.get_border_face(inv[index]);
                this.clipped_faces[index].push(
                    BlockType.triangulate(
                        BlockType.clip_face(plane.normal,face,neighbor_face)
                    )
                );
            });
        });
    }

    static draw_face(x, y, z, face, brightness, color){
        Immediate.color(
            brightness * color.r,
            brightness * color.g,
            brightness * color.b,
            255
        );
        face.forEach((position)=>{
            Immediate.position(
                x + position.x,
                y + position.y,
                z + position.z
            );
        });
    }

    draw(color){
        this.triangulated_faces.forEach((face, face_id)=>{
            var brightness = this.brightnesses[face_id];
            BlockType.draw_face(0, 0, 0, face, brightness, color);
        });
    }

    draw_clipped_face(x, y, z, index, neighbor_id, color){
        var face = this.clipped_faces[index][neighbor_id];
        if (face == null) return;
        var brightness = BlockType.border_brightnesses[index];
        BlockType.draw_face(x, y, z, face, brightness, color);
    }

    draw_non_border_faces(x, y, z, color){
        this.non_border_face_ids.forEach((face_id)=>{
            var face = this.triangulated_faces[face_id];
            var brightness = this.brightnesses[face_id];
            BlockType.draw_face(x, y, z, face, brightness, color);
        });
    }

    draw_wireframe(x, y, z){
        Immediate.begin_lines();
        Immediate.color(0,0,0,255);
        this.unique_edges.forEach((edge)=>{
            edge.forEach((pos_id)=>{
                var pos = this.wire_positions[pos_id];
                Immediate.position(
                    x + pos.x,
                    y + pos.y,
                    z + pos.z
                );
            });
        });
        Immediate.end();
    }

    static get_by_bitmap(bitmap){
        return BlockType.bitmap_to_type.get(bitmap);
    }

    static push_type(positions, bitmap, faces, expanded_positions, expanded_faces){
        BlockType.types.push(new BlockType(
            BlockType.types.length,
            positions,
            bitmap,
            faces,
            expanded_positions,
            expanded_faces
        ));
    }

    static gen(positions, faces, expanded_positions, expanded_faces){
        for (var z = 0; z < 4; z++){
            for (var x = 0; x < 4; x++){
                for (var y = 0; y < 4; y++){
                    var rotated_positions = [];
                    for (var i = 0; i < positions.length; i++){
                        var pos = positions[i].clone();
                        pos.sub(new Vec3(1,1,1));
                        pos.rotate_x(x*90.0);
                        pos.rotate_y(y*90.0);
                        pos.rotate_z(z*90.0);
                        pos.add(new Vec3(1,1,1));
                        pos.round();
                        rotated_positions.push(pos);
                    }
                    var bitmap = get_bitmap(rotated_positions);
                    if (BlockType.get_by_bitmap(bitmap) != null) continue;
                    var rotated_expanded_positions = [];
                    for (var i = 0; i < expanded_positions.length; i++){
                        var ep = expanded_positions[i];
                        var offset = ep.offset.clone();
                        offset.rotate_x(x*90.0);
                        offset.rotate_y(y*90.0);
                        offset.rotate_z(z*90.0);
                        offset.round();
                        rotated_expanded_positions.push(new ExpandedPosition(
                            ep.parent,
                            offset
                        ));
                    }
                    BlockType.push_type(
                        rotated_positions,
                        bitmap,
                        faces,
                        rotated_expanded_positions,
                        expanded_faces
                    );
                    if (x == 0 && y == 0 && z == 0){
                        BlockType.base_types.push(
                            BlockType.types[BlockType.types.length-1]
                        );
                    }
                }
            }
        }
    }

    static init(){

        BlockType.iterate_borders((component, direction, index, plane)=>{
            BlockType.border_brightnesses.push(BlockType.get_brightness(plane.normal))
        });

        BlockType.push_type([],0,[],[],[]); // air

        BlockType.gen( // cube
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

        BlockType.gen(
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

        /*
        gen([ // 45 corner
            [0,0,0],
            [0,0,2],
            [2,0,2],
            [0,2,2],
        ]);

        gen([ // low wedge
            [0,0,0],
            [2,0,0],
            [0,0,2],
            [2,0,2],
            [2,1,2],
            [0,1,2],
        ]);

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

        BlockType.types.forEach((type)=>{
            type.build_clipped_faces();
        });
    }

    static get(id){
        return BlockType.types[id];
    }
}