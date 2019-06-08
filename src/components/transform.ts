import { vec3, quat, mat4 } from "gl-matrix";
import { Component } from "../ecs";

class Transform3D {
	private _translation: vec3 = vec3.create();
	private _rotation: quat = quat.create();
	private _scale: vec3 = vec3.fromValues(1, 1, 1);

	translateX(units: number): void {
		this._translation[0] += units;
	}
	
	translateY(units: number): void {
		this._translation[1] += units;
	}

	translateZ(units: number): void {
		this._translation[2] += units;
	}

	translate(units: vec3): void {
		this.translateX(units[0]);
		this.translateY(units[1]);
		this.translateZ(units[2]);
	}

	get translation(): vec3 {
		return this._translation;
	}

	set translation(units: vec3) {
		this._translation = units;
	}

	rotateX(rad: number): void {
		quat.rotateX(this._rotation, this._rotation, rad);
	}

	rotateY(rad: number): void {
		quat.rotateY(this._rotation, this._rotation, rad);
	}

	rotateZ(rad: number): void {
		quat.rotateZ(this._rotation, this._rotation, rad);
	}

	rotate(rotation_quat: quat): void {
		quat.multiply(this._rotation, this._rotation, rotation_quat);
	}

	get rotation(): quat {
		return this._rotation;
	}

	set rotation(rotation_quat: quat) {
		this._rotation = rotation_quat;
	}

	set euler_angles(degrees: vec3) {
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

	scaleBy(units: vec3): void {
		this.scaleByX(units[0]);
		this.scaleByY(units[1]);
		this.scaleByZ(units[2]);
	}

	set scale(units: vec3) {
		this._scale = units;
	}

	get scale(): vec3 {
		return this._scale;
	}

	get object_to_world_matrix(): mat4 {
		var matrix = mat4.create();
		mat4.fromRotationTranslationScale(matrix, this._rotation, this._translation, this._scale);
		return matrix;
	}

	get world_to_object_matrix(): mat4 {
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

	translate(units: vec3): void {
		this._transform.translate(units);
	}

	get translation(): vec3 {
		return this._transform.translation;
	}

	set translation(units: vec3) {
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

	rotate(rotation_quat: quat): void {
		this._transform.rotate(rotation_quat);
	}

	get rotation(): quat {
		return this._transform.rotation;
	}

	set rotation(rotation_quat: quat) {
		this._transform.rotation = rotation_quat;
	}

	set euler_angles(degrees: vec3) {
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

	scaleBy(units: vec3): void {
		this._transform.scaleBy(units);
	}

	set scale(units: vec3) {
		this._transform.scale = units;
	}

	get scale(): vec3 {
		return this._transform.scale;
	}

	get object_to_world_matrix(): mat4 {
		return this._transform.object_to_world_matrix;
	}

	get world_to_object_matrix(): mat4 {
		return this._transform.world_to_object_matrix;
	}
}