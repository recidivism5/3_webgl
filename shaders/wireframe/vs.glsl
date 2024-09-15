attribute vec3 a_position;
attribute vec3 a_barycentric;

varying vec3 v_barycentric;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_barycentric = a_barycentric;
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}