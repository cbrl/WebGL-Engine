import { vec3, quat, mat4 } from "./gl-matrix";

export class Transform {
	private _translation: Float32Array = vec3.create();
	private _rotation: Float32Array = quat.create();
	private _scale: Float32Array = vec3.fromValues(1, 1, 1);

	translateX(units: number): void {
		this.translation[0] += units;
	}
	
	translateY(units: number): void {
		this.translation[1] += units;
	}

	translateZ(units: number): void {
		this.translation[2] += units;
	}

	translate(units: Float32Array): void {
		this.translateX(units[0]);
		this.translateY(units[1]);
		this.translateZ(units[2]);
	}

	get translation(): Float32Array {
		return this._translation;
	}

	set translation(units: Float32Array) {
		this._translation = units;
	}

	rotateX(rad: number): void {
		quat.rotateX(this.rotation, this.rotation, rad);
	}

	rotateY(rad: number): void {
		quat.rotateY(this.rotation, this.rotation, rad);
	}

	rotateZ(rad: number): void {
		quat.rotateZ(this.rotation, this.rotation, rad);
	}

	rotate(quat): void {
		quat.multiply(this.rotation, quat, this.rotation);
	}

	get rotation(): Float32Array {
		return this._rotation;
	}

	set rotation(quat: Float32Array) {
		this._rotation = quat;
	}

	set euler_angles(degrees: Float32Array) {
		quat.fromEuler(this.rotation, degrees[0], degrees[1], degrees[2]);
	}

	scaleByX(units: number): void {
		this._scale[0] *= units;
	}

	scaleByY(units: number): void {
		this._scale[1] *= units;
	}

	scaleByZ(units: number): void {
		this._scale[2] *= units;
	}

	scaleBy(units: Float32Array): void {
		this.scaleByX(units[0]);
		this.scaleByY(units[1]);
		this.scaleByZ(units[2]);
	}

	set scale(units: Float32Array) {
		this._scale = units;
	}

	get scale(): Float32Array {
		return this._scale;
	}

	get object_to_world_matrix(): Float32Array {
		var matrix = mat4.create();
		mat4.fromRotationTranslationScale(matrix, this._rotation, this._translation, this._scale);
		return matrix;
	}

	get world_to_object_matrix(): Float32Array {
		var matrix = mat4.create();
		mat4.fromRotationTranslationScale(matrix, this._rotation, this._translation, this._scale)
		mat4.invert(matrix, matrix);
		return matrix;
	}
}