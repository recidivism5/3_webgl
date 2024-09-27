import * as Mat4 from "./mat4.js"

var modelview = [Mat4.create()];
var projection = [Mat4.create()];

var temp = Mat4.create();

var cur = modelview;

function get(){
    return cur[cur.length-1];
}

function apply(){
    Mat4.mul(get(),get(),temp);
}

export class Mat4Stack {
    static MODELVIEW = 0;
    static PROJECTION = 1;

    static mode(id){
        if (id == Mat4Stack.MODELVIEW){
            cur = modelview;
        } else if (id == Mat4Stack.PROJECTION){
            cur = projection;
        } else {
            console.error("invalid mat4 stack id:",id);
        }
    }

    static push(){
        cur.push(Mat4.clone(get()));
    }

    static pop(){
        if (cur.length > 1){
            cur.pop();
        }
    }

    static upload(){
        var shader = gl.getParameter(gl.CURRENT_PROGRAM);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_modelview"),gl.FALSE,modelview[modelview.length-1]);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_projection"),gl.FALSE,projection[projection.length-1]);
    }

    static load_identity(){
        Mat4.identity(get());
    }

    static scale(v){
        Mat4.scale(temp,v);
        apply();
    }

    static translate(v){
        Mat4.translate(temp,v);
        apply();
    }

    static rotate_x(degrees){
        Mat4.rotate_x(temp,degrees);
        apply();
    }

    static rotate_y(degrees){
        Mat4.rotate_y(temp,degrees);
        apply();
    }

    static rotate_z(degrees){
        Mat4.rotate_z(temp,degrees);
        apply();
    }

    static perspective(fovy_degrees, aspect, near, far){
        Mat4.perspective_rh_no(temp,fovy_degrees,aspect,near,far);
        apply();
    }
}