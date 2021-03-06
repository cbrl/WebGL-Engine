export const forward_vs = String.raw`#version 300 es
precision mediump float;

in vec3 in_position;
in vec3 in_normal;
in vec3 in_color;

out vec3 position_world;
out vec3 normal;
out vec3 color;

layout(std140) uniform Camera {
	mat4 camera_to_world;
	mat4 world_to_camera;
	mat4 camera_to_projection;
	mat4 projection_to_camera;
} camera;


struct Material {
	vec4 base_color;
	float roughness;
	float metalness;
	vec2 pad;
};

layout(std140) uniform Model {
	mat4 model_to_world;
	mat4 world_inv_transpose;
	mat4 tex_transform;
	Material material;
} model;


// Transform a texture
vec2 Transform(vec2 tex, mat4 tex_transform) {
	return (tex_transform * vec4(tex, 0.0f, 1.0f)).xy;
}


// Transform a point from object space to projection space
vec4 Transform(vec3 position,
               mat4 object_to_world,
               mat4 world_to_view,
               mat4 view_to_projection) {

	vec3 world = (object_to_world * vec4(position, 1.0f)).xyz;
	vec3 view  = (world_to_view * vec4(world, 1.0f)).xyz;
	vec4 proj  = view_to_projection * vec4(view, 1.0f);

	return proj;
}


// Transform a point from world space to projection space
vec4 Transform(vec3 world,
               mat4 world_to_view,
               mat4 view_to_projection) {

	vec3 view = (world_to_view * vec4(world, 1.0f)).xyz;
	vec4 proj = view_to_projection * vec4(view, 1.0f);

	return proj;
}


struct PositionNormalTexture {
	vec4 position;
	vec3 position_world;
	vec3 normal;
	vec2 texcoord;
};

PositionNormalTexture Transform(vec3 position,
								vec3 normal,
                                vec2 texcoord,
                                mat4 object_to_world,
                                mat4 world_to_view,
                                mat4 view_to_projection,
                                mat4 world_inv_transpose,
                                mat4 texture_transform) {
	PositionNormalTexture vout;

	// Transform to world space
	vout.position_world = (object_to_world * vec4(position, 1.0f)).xyz;

	// Normal
	vout.normal = normalize(mat3(world_inv_transpose) * normal);

	// Transform to homogeneous clip space
	vout.position = Transform(vout.position_world, world_to_view, view_to_projection);

	// Output vertex attributes for interpolation across triangle
	vout.texcoord = Transform(texcoord, texture_transform);

	return vout;
}


void main() {
	gl_Position = Transform(in_position, model.model_to_world, camera.world_to_camera, camera.camera_to_projection);
	position_world = (model.model_to_world * vec4(in_position, 1.0f)).xyz;
	normal = in_normal;
	color = in_color;
}
`;