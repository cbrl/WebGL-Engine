export const forward_fs = String.raw`#version 300 es
precision mediump float;

in vec3 world_position;
in vec3 normal;
in vec3 color;

layout(location = 0) out vec4 out_color;

void main() {
	out_color = vec4(color, 1);
}
`;