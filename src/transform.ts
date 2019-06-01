import { vec3, quat, mat4 } from "./gl-matrix";
import { Component } from "./ecs";

class Transform3D {
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

	rotate(rotation_quat: Float32Array): void {
		quat.multiply(this.rotation, rotation_quat, this.rotation);
	}

	get rotation(): Float32Array {
		return this._rotation;
	}

	set rotation(rotation_quat: Float32Array) {
		this._rotation = rotation_quat;
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



export class Transform extends Component {
	_transform: Transform3D = new Transform3D();
	
	constructor() {
		super();
	}
	
	translateX(units: number): void {
		this._transform.translateX(units);
	}
	
	translateY(units: number): void {
		this._transform.translateY(units);
	}

	translateZ(units: number): void {
		this._transform.translateZ(units);
	}

	translate(units: Float32Array): void {
		this._transform.translate(units);
	}

	get translation(): Float32Array {
		return this._transform.translation;
	}

	set translation(units: Float32Array) {
		this._transform.translation = units;
	}

	rotateX(rad: number): void {
		this._transform.rotateX(rad);
	}

	rotateY(rad: number): void {
		this._transform.rotateY(rad);
	}

	rotateZ(rad: number): void {
		this._transform.rotateZ(rad);
	}

	rotate(rotation_quat): void {
		this._transform.rotate(rotation_quat);
	}

	get rotation(): Float32Array {
		return this._transform.rotation;
	}

	set rotation(rotation_quat: Float32Array) {
		this._transform.rotation = rotation_quat;
	}

	set euler_angles(degrees: Float32Array) {
		this._transform.euler_angles = degrees;
	}

	scaleByX(units: number): void {
		this._transform.scaleByX(units);
	}

	scaleByY(units: number): void {
		this._transform.scaleByY(units);
	}

	scaleByZ(units: number): void {
		this._transform.scaleByZ(units);
	}

	scaleBy(units: Float32Array): void {
		this._transform.scaleBy(units);
	}

	set scale(units: Float32Array) {
		this._transform.scale = units;
	}

	get scale(): Float32Array {
		return this._transform.scale;
	}

	get object_to_world_matrix(): Float32Array {
		return this._transform.object_to_world_matrix;
	}

	get world_to_object_matrix(): Float32Array {
		return this._transform.world_to_object_matrix;
	}
}