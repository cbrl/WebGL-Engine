export const forward_fs = String.raw`#version 300 es
precision mediump float;

in vec3 position_world;
in vec3 normal;
in vec3 color;

layout(location = 0) out vec4 out_color;

// Precomputed Pi values
const float g_pi            = 3.14159265359;  // pi
const float g_2pi           = 6.28318530718;  // 2*pi
const float g_inv_pi        = 0.31830988618;  // 1/pi
const float g_inv_2pi       = 0.15915494309;  // 1/(2*pi)
const float g_pi_div_2      = 1.57079632679;  // pi/2
const float g_pi_div_4      = 0.78539816339;  // pi/4
const float g_sqrt_2_div_pi = 0.79788456080;  // sqrt(2/pi)

struct Material {
	vec4   base_color;
	
	vec2   pad0;
	float  roughness;
	float  metalness;

	vec3   emissive;
	float  pad1;
};

struct DirectionalLight {
	vec3  intensity;
	float pad0;

	vec3  direction;
	float pad1;

	mat4  world_to_projection;
};

struct PointLight {
	vec3  intensity;
	float pad0;

	vec3  position;
	float range;

	vec3  attenuation;
	float pad1;
};

struct SpotLight {
	vec3  intensity;
	float pad0;
	
	vec3  position;
	float range;

	vec3  direction;
	float cos_umbra;

	vec3  attenuation;
	float cos_penumbra;
};


//----------------------------------------------------------------------------------
// Camera Buffer
//----------------------------------------------------------------------------------
layout(std140) uniform Camera {
	mat4 camera_to_world;
	mat4 world_to_camera;
	mat4 camera_to_projection;
	mat4 projection_to_camera;
} camera;

vec3 CameraPosition() {
	return camera.camera_to_world[3].xyz;
	//return g_camera_to_world._41_42_43;
}


//----------------------------------------------------------------------------------
// Light Buffer
//----------------------------------------------------------------------------------
#define MAX_DIRECTIONAL_LIGHTS 8
#define MAX_POINT_LIGHTS 8
#define MAX_SPOT_LIGHTS 8

layout(std140) uniform Lights {
	DirectionalLight directional_lights[MAX_DIRECTIONAL_LIGHTS];
	PointLight       point_lights[MAX_POINT_LIGHTS];
	SpotLight        spot_lights[MAX_SPOT_LIGHTS];
	vec3             ambient_intensity;
	float            pad0;
} lights;



//----------------------------------------------------------------------------------
// Perspective Divide
//----------------------------------------------------------------------------------
vec3 PerspectiveDiv(vec4 v) {
	return v.xyz / v.w;
}

//----------------------------------------------------------------------------------
// Attenuation
//----------------------------------------------------------------------------------
//          d: distance to light
// att_values: constant, linear, and quadratic attenuation values respectively
//----------------------------------------------------------------------------------
float Attenuation(float d, vec3 att_values) {
	float denom = dot(att_values, vec3(1.0f, d, d*d));
	return 1.0f / max(denom, 0.01f);
}
float DistanceAttenuation(float d) {
	return Attenuation(d, vec3(0.0f, 0.0f, 1.0f));
}


//----------------------------------------------------------------------------------
// SpotIntensity
//----------------------------------------------------------------------------------
//         L: surface-to-light vector
//         D: light direction
// cos_theta: cosine of the umbra angle
//   cos_phi: cosine of the penumbra angle
//----------------------------------------------------------------------------------
float SpotIntensity(vec3 L, vec3 D, float cos_theta, float cos_phi) {
	float alpha = dot(-L, D);
	return smoothstep(cos_phi, cos_theta, alpha);
}


//----------------------------------------------------------------------------------
// Lighting Calculation - Directional Light
//----------------------------------------------------------------------------------
void CalculateLight(DirectionalLight light, vec3 p_world, out vec3 p_to_light, out vec3 irradiance, out vec3 p_ndc) {
	p_to_light = -light.direction;

	vec4 p_clip = light.world_to_projection * vec4(p_world, 1.0f);
	p_ndc = PerspectiveDiv(p_clip);

	// Illuminate the point if it is within the light's NDC space
	if (all(lessThan(abs(p_ndc), vec3(1.0f))) && (p_ndc.z >= 0.0f))
		irradiance = light.intensity;
	else
		irradiance = 0.0f;
}

void CalculateLight(DirectionalLight light, vec3 p_world, out vec3 p_to_light, out vec3 irradiance) {
	vec3 p_ndc;
	vec3 p_to_l0;
	vec3 irradiance0;

	CalculateLight(light, p_world, p_to_l0, irradiance0, p_ndc);

	p_to_light = p_to_l0;
	irradiance = irradiance0;
}


//----------------------------------------------------------------------------------
// Lighting Calculation - Point Light
//----------------------------------------------------------------------------------
void CalculateLight(PointLight light, vec3 p_world, out vec3 p_to_light, out vec3 irradiance) {
	// The vector from the surface to the light
	p_to_light = light.position - p_world;

	// The distance from surface to light
	float d = length(p_to_light);

	// Normalize the light vector
	p_to_light /= d;

	if (d <= light.range) {
		// Attenuation
		float att_factor = Attenuation(d, light.attenuation);
		irradiance = light.intensity * att_factor;
	}
	else {
		irradiance = vec3(0.0f);
	}
}


//----------------------------------------------------------------------------------
// Lighting Calculation - Spot Light
//----------------------------------------------------------------------------------
void CalculateLight(SpotLight light, vec3 p_world, out vec3 p_to_light, out vec3 irradiance) {
	// The vector from the surface to the light.
	p_to_light = light.position - p_world;

	// The distance from surface to light.
	float d = length(p_to_light);

	// Normalize the light vector.
	p_to_light /= d;

	if (d <= light.range) {
		float att_factor  = Attenuation(d, light.attenuation);
		float spot_factor = SpotIntensity(p_to_light, light.direction, light.cos_umbra, light.cos_penumbra);

		irradiance = light.intensity * att_factor * spot_factor;
	}
	else {
		irradiance = vec3(0.0f);
	}
}

void Lambert(vec3 l, vec3 n, vec3 v, Material mat, out vec3 diffuse, out vec3 specular) {
	diffuse  = (1.0f - mat.metalness) * mat.base_color.xyz * g_inv_pi;
	specular = vec3(0.0f);
}

void ComputeBRDF(vec3 p_to_light, vec3 normal, vec3 p_to_view, Material mat, out vec3 diffuse, out vec3 specular) {
	Lambert(p_to_light, normal, p_to_view, mat, diffuse, specular);
}


vec3 CalculateLights(vec3 p_world, vec3 normal, vec3 p_to_view, Material material) {
	vec3 radiance = vec3(0.0f);

	for (int i0 = 0; i0 < MAX_DIRECTIONAL_LIGHTS; ++i0) {
		vec3 p_to_light, irradiance;

		CalculateLight(lights.directional_lights[i0], p_world, p_to_light, irradiance);

		if (all(equal(irradiance, vec3(0.0f))))
			continue;

		vec3 D, S;
		ComputeBRDF(p_to_light, normal, p_to_view, material, D, S);

		radiance += (D + S) * irradiance * clamp(dot(normal, p_to_light), 0.0f, 1.0f);
	}

	for (int i1 = 0; i1 < MAX_POINT_LIGHTS; ++i1) {
		vec3 p_to_light, irradiance;

		CalculateLight(lights.point_lights[i1], p_world, p_to_light, irradiance);

		if (all(equal(irradiance, vec3(0.0f))))
			continue;

		vec3 D, S;
		ComputeBRDF(p_to_light, normal, p_to_view, material, D, S);

		radiance += (D + S) * irradiance * clamp(dot(normal, p_to_light), 0.0f, 1.0f);
	}

	for (int i2 = 0; i2 < MAX_SPOT_LIGHTS; ++i2) {
		vec3 p_to_light, irradiance;

		CalculateLight(lights.spot_lights[i2], p_world, p_to_light, irradiance);

		if (all(equal(irradiance, vec3(0.0f))))
			continue;

		vec3 D, S;
		ComputeBRDF(p_to_light, normal, p_to_view, material, D, S);

		radiance += (D + S) * irradiance * clamp(dot(normal, p_to_light), 0.0f, 1.0f);
	}
	
	return radiance;
}


vec3 CalculateLighting(vec3 p_world, vec3 normal, Material material) {
	vec3 radiance = vec3(0.0f);
	
	vec3  p_to_view      = CameraPosition() - p_world;
	float dist_p_to_view = length(p_to_view);
	p_to_view /= dist_p_to_view;

	// Calculate radiance
	radiance += CalculateLights(p_world, normal, p_to_view, material);

	// Calculate ambient light
	vec3 ambient;
	vec3 null;
	Lambert(vec3(0.0f), vec3(0.0f), vec3(0.0f), material, ambient, null);
	ambient *= lights.ambient_intensity;

	return radiance + ambient;
}


void main() {
	Material mat;
	mat.base_color = vec4(color, 1.0f);
	mat.metalness = 0.0f;
	mat.roughness = 1.0f;
	mat.emissive = vec3(0.0f);

	vec3 lit_color = CalculateLighting(position_world, normal, mat);
	lit_color = clamp(lit_color, 0.0f, 1.0f);
	
	out_color = vec4(lit_color, 1.0f);
	//out_color = vec4(color, 1.0f);
}
`;