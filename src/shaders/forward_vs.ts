export const forward_vs = String.raw`
attribute vec3 a_position;
attribute vec3 a_color;
varying vec3 v_color;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_proj;

void main() {
	gl_Position = u_proj * u_view * u_world * vec4(a_position, 1);
	v_color = a_color;
}
`;