#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec3 v_barycentric;
varying float v_type;
varying vec4 v_color;
varying vec4 v_wirecolor;

const float wire_width = 1.0;
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
	float t;
	if (v_type == 3.0)
		t = min(b.x, min(b.y, b.z));
	else if (v_type == 2.0)
		t = min(b.x, b.z);
	else if (v_type == 1.0)
		t = b.x;
	else
		t = 1.0;
	gl_FragColor = mix(v_wirecolor, v_color, t);
}