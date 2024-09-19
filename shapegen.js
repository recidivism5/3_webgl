import {Vec3} from "./vec3.js"

export function box(x,y,z){
    return [
        new Vec3(-x,-y,-z),
        new Vec3(-x, y,-z),
        new Vec3(-x,-y, z),
        new Vec3(-x, y, z),

        new Vec3( x,-y,-z),
        new Vec3( x, y,-z),
        new Vec3( x,-y, z),
        new Vec3( x, y, z),
    ];
}

export function cube(radius){
    return box(radius,radius,radius);
}

export function cylinder(radius, height, subdivisions){
    if (subdivisions < 3){
        subdivisions = 3;
        console.error("invalid cylinder subdivisions: less than the minimum of 3");
    }
    var positions = [];
    var d = 2*Math.PI/subdivisions;
    for (var i = 0; i < subdivisions; i++){
        var r = i*d;
        var c = radius * Math.cos(r);
        var s = radius * Math.sin(r);
        positions.push(new Vec3(c,height/2,s));
        positions.push(new Vec3(c,-height/2,s));
    }
    return positions;
}