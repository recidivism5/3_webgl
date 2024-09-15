#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec3 v_barycentric;

const vec3 wire_color = vec3(0.0,0.0,0.0);
const vec3 color = vec3(0.0,1.0,0.0);
const float wire_width = 2.0;
const float wire_smoothness = 0.0;

/*
uniform vec4 albedo : source_color = vec4(1.0);
uniform vec4 wire_color : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float wire_width : hint_range(0.0, 40.0) = 5.0;
uniform float wire_smoothness : hint_range(0.0, 0.1) = 0.01;
*/

void main(){
    vec3 d = fwidth(v_barycentric);
	vec3 b = smoothstep(d * wire_width - wire_smoothness, d * wire_width + wire_smoothness, v_barycentric);
	float t = min(b.x, min(b.y, b.z));
	gl_FragColor = vec4(mix(wire_color, color, t),1.0);
}