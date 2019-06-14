export const forward_fs = String.raw`#version 300 es
precision mediump float;

in vec3 world_position;
in vec3 normal;
in vec3 color;

layout(location = 0) out vec4 out_color;

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


layout(std140) uniform Lights {
	DirectionalLight g_directional_lights[8];
	PointLight       g_point_lights[8];
	SpotLight        g_spot_lights[8];
	
	float            n_directional_lights;
	float            n_point_lights;
	float            n_spot_lights;
	float            lb_pad0;
};



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

	irradiance = (any(lessThan(vec3(1.0f), abs(p_ndc))) || 0.0f > p_ndc.z) ? vec3(0.0f) : light.intensity;
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


void Calculate(SpotLight light, vec3 p_world, out vec3 p_to_light, out vec3 irradiance) {
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


//----------------------------------------------------------------------------------
// Lighting Calculation - Spot Light
//----------------------------------------------------------------------------------

void main() {
	out_color = vec4(color, 1);
}
`;