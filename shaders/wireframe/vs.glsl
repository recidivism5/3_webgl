attribute vec3 a_position;
attribute vec3 a_barycentric;

varying vec3 v_barycentric;
varying float v_type;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_barycentric = a_barycentric;
    v_type = dot(a_barycentric,vec3(1));
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}