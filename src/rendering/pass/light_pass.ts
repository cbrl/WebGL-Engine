import { Scene } from "../scene";
import { Program } from "../shader";
import { LightBuffer, DirectionalLightBuffer } from "../buffer/buffers";

import { Entity } from "../../ecs";
import { DirectionalLight } from "../../components/directional_light";
import { Transform } from "../../components/transform";
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
			if (this._light_buffer.directional_lights.length == LightBuffer.max_directional_lights)
				return;

			var transform: Transform = entity.getComponent(Transform);
			var light: DirectionalLight = entity.getComponent(DirectionalLight);
			
			var lbuffer: DirectionalLightBuffer = new DirectionalLightBuffer;
			lbuffer.direction = transform.world_axis_z;

			vec3.copy(lbuffer.intensity, light.base_color);
			vec3.scale(lbuffer.intensity, lbuffer.intensity, light.intensity)
			
			mat4.multiply(lbuffer.world_to_projection, light.light_to_projection_matrix, transform.world_to_object_matrix);

			this._light_buffer.directional_lights.push(lbuffer);
		});
	}
	
	private updatePointLights(scene: Scene): void {

	}

	private updateSpotLights(scene: Scene): void {

	}
}