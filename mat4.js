export function create(){
    var m = new Float32Array(16);
    identity(m);
    return m;
}

export function clone(a){
    return new Float32Array(a);
}

export function identity(out){
    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
            out[i*4+j] = i == j ? 1.0 : 0.0;
        }
    }
}

export function mul(out,a,b){
    var ac = clone(a);
    var bc = clone(b);
    for (var i = 0; i < 4; i++){
        for (var j = 0; j < 4; j++){
            out[i*4+j] = ac[0*4+j]*bc[i*4+0] + ac[1*4+j]*bc[i*4+1] + ac[2*4+j]*bc[i*4+2] + ac[3*4+j]*bc[i*4+3];
        }
    }
}

export function scale(out, x, y, z){
    identity(out);
    out[0] = x;
    out[5] = y;
    out[10] = z;
}

export function translate(out, x, y, z){
    identity(out);
    out[12] = x;
    out[13] = y;
    out[14] = z;
}

export function rotate_x(out,degrees){
    var radians = degrees*Math.PI/180.0;
    var c = Math.cos(radians);
    var s = Math.sin(radians);

    identity(out);

    out[1*4+1] = c;
	out[1*4+2] = s;
	
	out[2*4+1] = -s;
	out[2*4+2] = c;
}

export function rotate_y(out,degrees){
    var radians = degrees*Math.PI/180.0;
    var c = Math.cos(radians);
    var s = Math.sin(radians);

    identity(out);

    out[0*4+0] = c;
	out[0*4+2] = -s;

	out[2*4+0] = s;
	out[2*4+2] = c;
}

export function rotate_z(out,degrees){
    var radians = degrees*Math.PI/180.0;
    var c = Math.cos(radians);
    var s = Math.sin(radians);

    identity(out);

    out[0*4+0] = c;
	out[0*4+1] = s;

	out[1*4+0] = -s;
	out[1*4+1] = c;
}

export function perspective_rh_no(out, fovy_degrees, aspect, near, far){
    var fovy_radians = fovy_degrees*Math.PI/180.0;
    var f = 1.0 / Math.tan(fovy_radians / 2), nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity){
        nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
    } else {
        out[10] = -1;
        out[14] = -2 * near;
    }
    return out;
}

export function ortho_rh_no(out, left, right, bottom, top, near, far){
    let lr = 1 / (left - right);
    let bt = 1 / (bottom - top);
    let nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
}