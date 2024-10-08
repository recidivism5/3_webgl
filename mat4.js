export class Mat4{
    constructor(
        a11, a12, a13, a14,
        a21, a22, a23, a24,
        a31, a32, a33, a34,
        a41, a42, a43, a44
    ){
        this.a11 = a11;
        this.a12 = a12;
        this.a13 = a13;
        this.a14 = a14;
        this.a21 = a21;
        this.a22 = a22;
        this.a23 = a23;
        this.a24 = a24;
        this.a31 = a31;
        this.a32 = a32;
        this.a33 = a33;
        this.a34 = a34;
        this.a41 = a41;
        this.a42 = a42;
        this.a43 = a43;
        this.a44 = a44;
    }

    to_array(){
        return [
            this.a11, this.a12, this.a13, this.a14,
            this.a21, this.a22, this.a23, this.a24,
            this.a31, this.a32, this.a33, this.a34,
            this.a41, this.a42, this.a43, this.a44
        ];
    }

    clone(){
        return new Mat4(
            this.a11, this.a12, this.a13, this.a14,
            this.a21, this.a22, this.a23, this.a24,
            this.a31, this.a32, this.a33, this.a34,
            this.a41, this.a42, this.a43, this.a44
        );
    }

    static new_identity(){
        return new Mat4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        );
    }

    set(
        a11, a12, a13, a14,
        a21, a22, a23, a24,
        a31, a32, a33, a34,
        a41, a42, a43, a44
    ){
        this.a11 = a11;
        this.a12 = a12;
        this.a13 = a13;
        this.a14 = a14;
        this.a21 = a21;
        this.a22 = a22;
        this.a23 = a23;
        this.a24 = a24;
        this.a31 = a31;
        this.a32 = a32;
        this.a33 = a33;
        this.a34 = a34;
        this.a41 = a41;
        this.a42 = a42;
        this.a43 = a43;
        this.a44 = a44;
        return this;
    }

    set_identity(){
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    }

    set_perspective(fovy_degrees, aspect, near, far){
        var fovy_radians = fovy_degrees*Math.PI/180.0;
        var f = 1.0 / Math.tan(fovy_radians / 2), nf;
        this.a11 = f / aspect;
        this.a12 = 0;
        this.a13 = 0;
        this.a14 = 0;
        this.a21 = 0;
        this.a22 = f;
        this.a23 = 0;
        this.a24 = 0;
        this.a31 = 0;
        this.a32 = 0;
        this.a34 = -1;
        this.a41 = 0;
        this.a42 = 0;
        this.a44 = 0;
        if (far != null && far !== Infinity){
            nf = 1 / (near - far);
            this.a33 = (far + near) * nf;
            this.a43 = 2 * far * near * nf;
        } else {
            this.a33 = -1;
            this.a43 = -2 * near;
        }
        return this;
    }

    set_ortho(left, right, bottom, top, near, far){
        let lr = 1 / (left - right);
        let bt = 1 / (bottom - top);
        let nf = 1 / (near - far);

        this.set(
            -2 * lr, 0, 0, 0,
            0, -2 * bt, 0, 0,
            0, 0, 2 * nf, 0,
            (left + right) * lr,
            (top + bottom) * bt,
            (far + near) * nf,
            1
        );
        return this;
    }

    mul(
        b11, b12, b13, b14,
        b21, b22, b23, b24,
        b31, b32, b33, b34,
        b41, b42, b43, b44
    ){
        var a11 = this.a11;
        var a12 = this.a12;
        var a13 = this.a13;
        var a14 = this.a14;
        var a21 = this.a21;
        var a22 = this.a22;
        var a23 = this.a23;
        var a24 = this.a24;
        var a31 = this.a31;
        var a32 = this.a32;
        var a33 = this.a33;
        var a34 = this.a34;
        var a41 = this.a41;
        var a42 = this.a42;
        var a43 = this.a43;
        var a44 = this.a44;
        this.a11 = b11 * a11 + b12 * a21 + b13 * a31 + b14 * a41;
        this.a12 = b11 * a12 + b12 * a22 + b13 * a32 + b14 * a42;
        this.a13 = b11 * a13 + b12 * a23 + b13 * a33 + b14 * a43;
        this.a14 = b11 * a14 + b12 * a24 + b13 * a34 + b14 * a44;
        this.a21 = b21 * a11 + b22 * a21 + b23 * a31 + b24 * a41;
        this.a22 = b21 * a12 + b22 * a22 + b23 * a32 + b24 * a42;
        this.a23 = b21 * a13 + b22 * a23 + b23 * a33 + b24 * a43;
        this.a24 = b21 * a14 + b22 * a24 + b23 * a34 + b24 * a44;
        this.a31 = b31 * a11 + b32 * a21 + b33 * a31 + b34 * a41;
        this.a32 = b31 * a12 + b32 * a22 + b33 * a32 + b34 * a42;
        this.a33 = b31 * a13 + b32 * a23 + b33 * a33 + b34 * a43;
        this.a34 = b31 * a14 + b32 * a24 + b33 * a34 + b34 * a44;
        this.a41 = b41 * a11 + b42 * a21 + b43 * a31 + b44 * a41;
        this.a42 = b41 * a12 + b42 * a22 + b43 * a32 + b44 * a42;
        this.a43 = b41 * a13 + b42 * a23 + b43 * a33 + b44 * a43;
        this.a44 = b41 * a14 + b42 * a24 + b43 * a34 + b44 * a44;
        return this;
    }

    scale(x, y, z){
        this.mul(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
        return this;
    }

    translate(x, y, z){
        this.mul(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
        return this;
    }

    rotate_x(degrees){
        var radians = degrees * Math.PI / 180;
        var s = Math.sin(radians);
        var c = Math.cos(radians);
        this.mul(
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        );
        return this;
    }

    rotate_y(degrees){
        var radians = degrees * Math.PI / 180;
        var s = Math.sin(radians);
        var c = Math.cos(radians);
        this.mul(
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        );
        return this;
    }

    rotate_z(degrees){
        var radians = degrees * Math.PI / 180;
        var s = Math.sin(radians);
        var c = Math.cos(radians);
        this.mul(
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        return this;
    }
}