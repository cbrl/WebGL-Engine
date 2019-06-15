import { Scene } from "../scene";
import { Program } from "../shader";
import { LightBuffer, DirectionalLightBuffer, PointLightBuffer, SpotLightBuffer } from "../buffer/buffers";

import { Entity } from "../../ecs";
import { Transform } from "../../components/transform";
import { DirectionalLight, PointLight, SpotLight } from "../../components/lights";
import { vec3, mat4 } from "gl-matrix";

export class LightPass {
	private _context: WebGL2RenderingContext;
	private _light_buffer: LightBuffer = new LightBuffer;

	constructor(context: WebGL2RenderingContext) {
		this._context = context;
	}

	updateLightBuffer(scene: Scene, program: Program): void {
		this.updateDirectionalLights(scene);
		this.updatePointLights(scene);
		this.updateSpotLights(scene);
		this.uploadLightBuffer(program);
	}

	private uploadLightBuffer(program: Program): void {
		program.updateUniform(this._context, "Lights", this._light_buffer.data);
	}

	private updateDirectionalLights(scene: Scene): void {
		this._light_buffer.directional_lights.splice(0, this._light_buffer.directional_lights.length);

		scene.ecs.forEach([DirectionalLight, Transform], (entity: Entity) => {
			if (this._light_buffer.directional_lights.length >= LightBuffer.max_directional_lights)
				return;

			var transform: Transform = entity.getComponent(Transform);
			var light: DirectionalLight = entity.getComponent(DirectionalLight);
			
			var lbuffer: DirectionalLightBuffer = new DirectionalLightBuffer;

			vec3.copy(lbuffer.intensity, light.base_color);
			vec3.scale(lbuffer.intensity, lbuffer.intensity, light.intensity)

			vec3.copy(lbuffer.direction, transform.world_axis_z);
			mat4.multiply(lbuffer.world_to_projection, light.light_to_projection_matrix, transform.world_to_object_matrix);

			this._light_buffer.directional_lights.push(lbuffer);
		});
	}
	
	private updatePointLights(scene: Scene): void {
		this._light_buffer.point_lights.splice(0, this._light_buffer.point_lights.length);

		scene.ecs.forEach([PointLight, Transform], (entity: Entity) => {
			if (this._light_buffer.point_lights.length >= LightBuffer.max_point_lights)
				return;

			var transform: Transform = entity.getComponent(Transform);
			var light: PointLight = entity.getComponent(PointLight);

			var lbuffer: PointLightBuffer = new PointLightBuffer;

			vec3.copy(lbuffer.intensity, light.base_color);
			vec3.scale(lbuffer.intensity, lbuffer.intensity, light.intensity);

			vec3.copy(lbuffer.position, transform.world_origin);
			vec3.copy(lbuffer.attenuation, light.attenuation);
			lbuffer.range = light.range;

			this._light_buffer.point_lights.push(lbuffer);
		});
	}

	private updateSpotLights(scene: Scene): void {
		this._light_buffer.spot_lights.splice(0, this._light_buffer.spot_lights.length);

		scene.ecs.forEach([SpotLight, Transform], (entity: Entity) => {
			if (this._light_buffer.spot_lights.length >= LightBuffer.max_spot_lights)
				return;

			var transform: Transform = entity.getComponent(Transform);
			var light: SpotLight = entity.getComponent(SpotLight);

			var lbuffer: SpotLightBuffer = new SpotLightBuffer;

			vec3.copy(lbuffer.intensity, light.base_color);
			vec3.scale(lbuffer.intensity, lbuffer.intensity, light.intensity);

			vec3.copy(lbuffer.position, transform.world_origin);
			vec3.copy(lbuffer.direction, transform.world_axis_z);
			vec3.copy(lbuffer.attenuation, light.attenuation);
			lbuffer.range = light.range;
			lbuffer.cos_umbra = light.cos_umbra;
			lbuffer.cos_penumbra = light.cos_penumbra;

			this._light_buffer.spot_lights.push(lbuffer);
		});
	}
}