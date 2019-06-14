import { Component } from "../ecs";
import { mat4 } from "gl-matrix";

export class PointLight extends Component {
	base_color: [number, number, number] = [0, 0, 0];
	intensity: number = 0;
	attenuation: [number, number, number] = [0, 0, 1];
	
	start: number = 0.1;
	range: number = 1.0;

	proj_size: [number, number] = [1.0, 1.0];

	get light_to_projection_matrix(): mat4 {
		const m22: number = this.range / (this.range - this.start);
		const m32: number = -this.start * m22;

		return mat4.fromValues(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, m22, 1.0,
			0.0, 0.0, m32, 0.0,
		);
	}
}