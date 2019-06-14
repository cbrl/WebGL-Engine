export const forward_vs = String.raw`#version 300 es
in vec3 a_position;
//in vec3 a_normal;
in vec3 a_color;
out vec3 v_color;

layout(std140) uniform Camera {
	mat4 g_world_to_camera;
	mat4 g_camera_to_projection;
};

layout(std140) uniform Model {
	mat4 g_model_to_world;
	mat4 g_world_inv_transpose;
	mat4 g_tex_transform;
};

void main() {
	gl_Position = g_camera_to_projection * g_world_to_camera * g_model_to_world * vec4(a_position, 1);
	//gl_Normal = a_normal;
	v_color = a_color;
}
`;