import {Mat4} from "./mat4.js"

var modelview = [Mat4.new_identity()];
var projection = Mat4.new_identity();

function get(){
    return modelview[modelview.length-1];
}

export class Mat4Stack {

    static push(){
        modelview.push(get().clone());
    }

    static pop(){
        if (modelview.length > 1){
            modelview.pop();
        }
    }

    static upload(){
        var shader = gl.getParameter(gl.CURRENT_PROGRAM);
        gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_modelview"),gl.FALSE,get().to_array());
        gl.uniformMatrix4fv(gl.getUniformLocation(shader,"u_projection"),gl.FALSE,projection.to_array());
    }

    static load_identity(){
        get().set_identity();
    }

    static scale(x, y, z){
        get().scale(x, y, z);
    }

    static translate(x, y, z){
        get().translate(x, y, z);
    }

    static rotate_x(degrees){
        get().rotate_x(degrees);
    }

    static rotate_y(degrees){
        get().rotate_y(degrees);
    }

    static rotate_z(degrees){
        get().rotate_z(degrees);
    }

    static project_perspective(fovy_degrees, aspect, near, far){
        projection.set_perspective(fovy_degrees, aspect, near, far);
    }

    static project_ortho(left, right, bottom, top, near, far){
        projection.set_ortho(left,right,bottom,top,near,far);
    }

    static project_identity(){
        projection.set_identity();
    }
    
}