import { Component } from "../ecs";
import { mat4 } from "gl-matrix";

export class DirectionalLight extends Component {
	base_color: [number, number, number] = [0, 0, 0];
	intensity: number = 0;
	
	start: number = 0.1;
	range: number = 1.0;

	proj_size: [number, number] = [1.0, 1.0];

	get light_to_projection_matrix(): mat4 {
		var out: mat4 = mat4.create();
		mat4.ortho(out, 0, this.proj_size[0], 0, this.proj_size[1], this.start, this.range);
		return out;
	}
}