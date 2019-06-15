import { Viewport } from "../rendering/viewport";
import { Component } from "../ecs";
import { mat4 } from "gl-matrix";

interface ICamera {
	camera_to_projection_matrix: mat4;
	viewport: Viewport;
	bindViewport(context: WebGL2RenderingContext): void;
}

export abstract class Camera extends Component implements ICamera {
	viewport: Viewport = new Viewport();
	protected _z_near: number = 0.1;
	protected _z_far: number = 100;

	abstract get camera_to_projection_matrix(): mat4;

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

	bindViewport(context: WebGL2RenderingContext): void {
		this.viewport.bind(context);
	}
}

export class OrthographicCamera extends Camera {
	private _ortho_size: [number, number];

	constructor(ortho_size: [number, number] = [512, 288]) {
		super();
		this.ortho_size = ortho_size
	}

	get ortho_size(): [number, number] {
		return this._ortho_size;
	}

	set ortho_size(value: [number, number]) {
		this._ortho_size = value;
	}
	
	get camera_to_projection_matrix(): mat4 {
		var matrix = mat4.create();
		mat4.ortho(matrix, -this._ortho_size[0]/2, this._ortho_size[0]/2, -this._ortho_size[1]/2, this._ortho_size[1]/2, this._z_near, this._z_far);
		return matrix;
	}
}

export class PerspectiveCamera extends Camera {
	fov_y: number;

	constructor(fov_y: number = Math.PI/4) {
		super();
		this.fov_y = fov_y;
	}
	
	get camera_to_projection_matrix(): mat4 {
		var matrix = mat4.create();
		mat4.perspective(matrix, this.fov_y, this.viewport.aspect_ratio, this._z_near, this._z_far);
		return matrix;
	}
}
