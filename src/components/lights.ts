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
		mat4.ortho(out, -this.proj_size[0]/2, this.proj_size[0]/2, -this.proj_size[1]/2, this.proj_size[1]/2, this.start, this.range);
		return out;
	}
}

export class PointLight extends Component {
	base_color: [number, number, number] = [0, 0, 0];
	intensity: number = 0;
	attenuation: [number, number, number] = [0, 0, 1];
	
	start: number = 0.1;
	range: number = 1.0;

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

export class SpotLight extends Component {
	base_color: [number, number, number] = [0, 0, 0];
	intensity: number = 0;
	attenuation: [number, number, number] = [0, 0, 1];

	private _cos_umbra: number = 1.0;
	private _cos_penumbra: number = 0.1;
	
	start: number = 0.1;
	range: number = 1.0;

	get light_to_projection_matrix(): mat4 {
		const fov: number = Math.acos(this._cos_penumbra) * 2;
		
		var out: mat4 = mat4.create();
		mat4.perspective(out, fov, 1.0, this.start, this.range);
		return out;
	}

	set cos_umbra(cos_angle: number) {
		this._cos_umbra = Math.max(Math.max(cos_angle, this._cos_penumbra + 0.001), 0.001);
	}
	set umbra_angle(radians: number) {
		this.cos_umbra = Math.cos(radians);
	}
	get cos_umbra(): number {
		return this._cos_umbra;
	}
	get umbra_angle(): number {
		return Math.acos(this._cos_umbra);
	}

	set cos_penumbra(cos_angle: number) {
		this._cos_penumbra = Math.max(Math.min(cos_angle, this._cos_umbra - 0.001), 0.001);
	}
	set penumbra_angle(radians: number) {
		this.cos_penumbra = Math.cos(radians);
	}
	get cos_penumbra(): number {
		return this._cos_penumbra;
	}
	get penumbra_angle(): number {
		return Math.acos(this._cos_penumbra);
	}
}