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


//----------------------------------------------------------------------------------
// Utility Functions
//----------------------------------------------------------------------------------
vec3 PerspectiveDiv(vec4 v) {
	return v.xyz / v.w;
}

float sqr(float value) {
	return value * value;
}
vec2 sqr(vec2 value) {
	return value * value;
}
vec3 sqr(vec3 value) {
	return value * value;
}
vec4 sqr(vec4 value) {
	return value * value;
}



//----------------------------------------------------------------------------------
// Model Uniform Buffer
//----------------------------------------------------------------------------------
struct Material {
	vec4  base_color;
	float roughness;
	float metalness;
	vec2  pad;
};

layout(std140) uniform Model {
	mat4     model_to_world;
	mat4     world_inv_transpose;
	mat4     tex_transform;
	Material material;
} model;


//----------------------------------------------------------------------------------
// Light Structs
//----------------------------------------------------------------------------------
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
// Trowbridge-Reitz (AKA: GGX) Distribution Function
//----------------------------------------------------------------------------------
float D_TrowbridgeReitz(float n_dot_h, float alpha) {
	// D = alpha^2 / { pi * [(n.h)^2 * (alpha^2 - 1) + 1]^2 }

	float alpha_sqr  = sqr(alpha);
	float denom_term = sqr(n_dot_h) * (alpha_sqr - 1.0f) + 1.0f;

	return (alpha_sqr / sqr(denom_term)) * g_inv_pi;
}


//----------------------------------------------------------------------------------
// Schlick Fresnel Function
//----------------------------------------------------------------------------------
vec3 F_Schlick(float l_dot_h, vec3 f0, vec3 f90) {
	// F(f0) = f0 + (f90-f0)(1-l.h)^5
	//       = f0(f90 - (1-l.h)^5) + (1-l.h)^5
	//       = lerp(f0, f90, (1-l.h)^5)

	float base       = 1.0f - l_dot_h;
	float base_pow_5 = sqr(sqr(base)) * base;

	//return f0 + ((f90 - f0) * base_pow_5);
	return mix(f0, f90, base_pow_5);
}


//----------------------------------------------------------------------------------
// Smith-GGX Visibitlity Function
//----------------------------------------------------------------------------------
float V1_GGX(float n_dot_x, float alpha) {

	// V1 = 2 / [(n.x) + sqrt(alpha^2 + (1-alpha^2)(n.x)^2)]

	float alpha_sqr   = sqr(alpha);
	float denominator = n_dot_x + sqrt(alpha_sqr + (1.0f - alpha_sqr) * sqr(n_dot_x));

	return 2.0f / denominator;
}

float V_Smith(float n_dot_l, float n_dot_v, float n_dot_h, float v_dot_h, float alpha) {
	return V1_GGX(n_dot_l, alpha) * V1_GGX(n_dot_v, alpha);
}


//----------------------------------------------------------------------------------
// BRDF Utility Functions
//----------------------------------------------------------------------------------
vec3 GetF0(Material mat) {
	// 0.04f = dielectric constant for metalness workflow (IOR of approx. 1.5)
	return mix(vec3(0.04f), mat.base_color.xyz, mat.metalness);
}

float GetAlpha(Material mat) {
	return max(sqr(mat.roughness), 0.01f);
}

//----------------------------------------------------------------------------------
// Lambert BRDF
//----------------------------------------------------------------------------------
void Lambert(vec3 l, vec3 n, vec3 v, Material mat, out vec3 diffuse, out vec3 specular) {
	diffuse  = (1.0f - mat.metalness) * mat.base_color.xyz * g_inv_pi;
	specular = vec3(0.0f);
}

//----------------------------------------------------------------------------------
// Blinn-Phong BRDF
//----------------------------------------------------------------------------------
void BlinnPhong(vec3 l, vec3 n, vec3 v, Material mat, out vec3 diffuse, out vec3 specular) {
	Lambert(l, n, v, mat, diffuse, specular);

	vec3 h        = normalize(l + v);
	float n_dot_h = max(dot(n, h), 0.0f);
	float power   = exp2((1.0f - mat.metalness) * 10.0f); //roughness[1, 0] -> exponent[0, 1024]
	specular = GetF0(mat) * pow(n_dot_h, power);
}

//----------------------------------------------------------------------------------
// Microfacet BRDF
//----------------------------------------------------------------------------------
void Microfacet(vec3 l, vec3 n, vec3 v, Material mat, out vec3 diffuse, out vec3 specular) {

	float n_dot_l = clamp(dot(n, l), 0.0f, 1.0f);
	float n_dot_v = clamp(dot(n, v), 0.0f, 1.0f);
	vec3  h       = normalize(l + v);
	float n_dot_h = clamp(dot(n, h), 0.0f, 1.0f);
	float l_dot_h = clamp(dot(l, h), 0.0f, 1.0f);
	float v_dot_h = clamp(dot(v, h), 0.0f, 1.0f);

	float alpha = GetAlpha(mat);
	vec3  f0    = GetF0(mat);

	float D = D_TrowbridgeReitz(n_dot_h, alpha);
	vec3  F = F_Schlick(l_dot_h, f0, vec3(1.0f));
	float V = V_Smith(n_dot_l, n_dot_v, n_dot_h, v_dot_h, alpha);

	diffuse = (1.0f - F) * (1.0f - mat.metalness) * mat.base_color.xyz * g_inv_pi;
	diffuse = clamp(diffuse, 0.0f, 1.0f);

	specular = D * F * V * 0.25f;
	specular = clamp(specular, 0.0f, 1.0f);
}

void ComputeBRDF(vec3 p_to_light, vec3 normal, vec3 p_to_view, Material mat, out vec3 diffuse, out vec3 specular) {
	Microfacet(p_to_light, normal, p_to_view, mat, diffuse, specular);
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
	if (all(lessThan(abs(p_ndc), vec3(1.0f))) && (p_ndc.z <= 0.0f))
		irradiance = light.intensity;
	else
		irradiance = vec3(0.0f);
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
	mat.metalness = model.material.metalness;
	mat.roughness = model.material.roughness;

	vec3 lit_color = CalculateLighting(position_world, normal, mat);
	lit_color = clamp(lit_color, 0.0f, 1.0f);
	
	out_color = vec4(lit_color, 1.0f);
	//out_color = vec4(color, 1.0f);
}
`;
