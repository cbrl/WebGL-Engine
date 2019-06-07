import { Viewport } from "../rendering/viewport";
import { Component } from "../ecs";
import { mat4 } from "gl-matrix";

interface Camera {
	camera_to_projection_matrix: mat4;
}

class OrthographicCamera extends Component implements Camera {
	viewport: Viewport = new Viewport();
	
	private _ortho_size: [number, number];
	private _z_near: number = 0.1;
	private _z_far: number = 100;

	constructor(ortho_size: [number, number] = [512, 288]) {
		super();
		this.ortho_size = ortho_size
	}

	get z_near(): number {
		return this._z_near;
	}

	set z_near(value: number) {
		if (value < 0.01) {
			console.error("Camera z_near should be >= 0.01. Provided value was", value);
			return;
		}
		if (value >= this._z_far) {
			console.error("Camera z_near should be < z_far. Provided value was", value, " and z_far is", this._z_far);
			return;
		}
		this._z_near = value;
	}

	get z_far(): number {
		return this._z_far;
	}

	set z_far(value: number) {
		if (value <= 0.01) {
			console.error("Camera z_far should be > 0.01. Provided value was", value);
			return;
		}
		if (value <= this.z_far) {
			console.error("Camera z_far should be > z_near. Provided value was", value, " and z_near is", this._z_near);
			return;
		}
		this._z_far = value;
	}

	get ortho_size(): [number, number] {
		return this._ortho_size;
	}

	set ortho_size(value: [number, number]) {
		this._ortho_size = value;
	}
	
	get camera_to_projection_matrix(): mat4 {
		var matrix = mat4.create();
		mat4.ortho(matrix, 0, this._ortho_size[0], 0, this._ortho_size[1], this._z_near, this._z_far);
		return matrix;
	}
}

class PerspectiveCamera extends Component implements Camera {
	viewport: Viewport = new Viewport();
	fov_y: number;

	private _z_near: number = 0.1;
	private _z_far: number = 100;

	constructor(fov_y: number = Math.PI/4) {
		super();
		this.fov_y = fov_y;
	}

	get z_near(): number {
		return this._z_near;
	}

	set z_near(value: number) {
		if (value < 0.01) {
			console.error("Camera z_near should be >= 0.01. Provided value was", value);
			return;
		}
		if (value >= this._z_far) {
			console.error("Camera z_near should be < z_far. Provided value was", value, " and z_far is", this._z_far);
			return;
		}
		this._z_near = value;
	}

	get z_far(): number {
		return this._z_far;
	}

	set z_far(value: number) {
		if (value <= 0.01) {
			console.error("Camera z_far should be > 0.01. Provided value was", value);
			return;
		}
		if (value <= this.z_far) {
			console.error("Camera z_far should be > z_near. Provided value was", value, " and z_near is", this._z_near);
			return;
		}
		this._z_far = value;
	}
	
	get camera_to_projection_matrix(): mat4 {
		var matrix = mat4.create();
		mat4.perspective(matrix, this.fov_y, this.viewport.aspect_ratio, this._z_near, this._z_far);
		return matrix;
	}
}

export {
	OrthographicCamera,
	PerspectiveCamera,
};