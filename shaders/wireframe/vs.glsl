attribute vec3 a_position;
attribute vec4 a_barycentric;
attribute vec4 a_color;
attribute vec4 a_wirecolor;

varying vec3 v_barycentric;
varying float v_type;
varying vec4 v_color;
varying vec4 v_wirecolor;

uniform mat4 u_modelview;
uniform mat4 u_projection;

void main(){
    v_barycentric = a_barycentric.xyz;
    v_type = a_barycentric.w;
    v_color = a_color;
    v_wirecolor = a_wirecolor;
    gl_Position = u_projection * u_modelview * vec4(a_position,1.0);
}