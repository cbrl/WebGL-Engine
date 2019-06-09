import { vec3, quat, mat4 } from "gl-matrix";
import { Component } from "../ecs";

class Transform3D {
	private _translation: vec3 = vec3.create();
	private _rotation: quat = quat.create();
	private _scale: vec3 = vec3.fromValues(1, 1, 1);

	private _object_to_world: mat4 = mat4.create();
	private _world_to_object: mat4 = mat4.create();

	private _dirty: boolean = false;

	translateX(units: number): void {
		this.setDirty();
		this._translation[0] += units;
	}
	
	translateY(units: number): void {
		this.setDirty();
		this._translation[1] += units;
	}

	translateZ(units: number): void {
		this.setDirty();
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
		this.setDirty();
		this._translation = units;
	}

	rotateX(rad: number): void {
		this.setDirty();
		quat.rotateX(this._rotation, this._rotation, rad);
	}

	rotateY(rad: number): void {
		this.setDirty();
		quat.rotateY(this._rotation, this._rotation, rad);
	}

	rotateZ(rad: number): void {
		this.setDirty();
		quat.rotateZ(this._rotation, this._rotation, rad);
	}

	rotate(rotation_quat: quat): void {
		this.setDirty();
		quat.multiply(this._rotation, this._rotation, rotation_quat);
	}

	get rotation(): quat {
		return this._rotation;
	}

	set rotation(rotation_quat: quat) {
		this.setDirty();
		this._rotation = rotation_quat;
	}

	set euler_angles(degrees: vec3) {
		this.setDirty();
		quat.fromEuler(this.rotation, degrees[0], degrees[1], degrees[2]);
	}

	scaleByX(units: number): void {
		this.setDirty();
		this._scale[0] *= units;
	}

	scaleByY(units: number): void {
		this.setDirty();
		this._scale[1] *= units;
	}

	scaleByZ(units: number): void {
		this.setDirty();
		this._scale[2] *= units;
	}

	scaleBy(units: vec3): void {
		this.scaleByX(units[0]);
		this.scaleByY(units[1]);
		this.scaleByZ(units[2]);
	}

	get scale(): vec3 {
		return this._scale;
	}
	
	set scale(units: vec3) {
		this.setDirty();
		this._scale = units;
	}

	get world_axis_x(): vec3 {
		this.updateMatrix();
		return vec3.fromValues(this._object_to_world[0], this._object_to_world[1], this._object_to_world[2]);
	}

	get world_axis_y(): vec3 {
		this.updateMatrix();
		return vec3.fromValues(this._object_to_world[4], this._object_to_world[5], this._object_to_world[6]);
	}

	get world_axis_z(): vec3 {
		this.updateMatrix();
		return vec3.fromValues(this._object_to_world[8], this._object_to_world[9], this._object_to_world[10]);
	}

	get world_origin(): vec3 {
		this.updateMatrix();
		return vec3.fromValues(this._object_to_world[12], this._object_to_world[13], this._object_to_world[14]);
	}

	get object_to_world_matrix(): mat4 {
		this.updateMatrix();
		return this._object_to_world;
	}

	get world_to_object_matrix(): mat4 {
		this.updateMatrix();
		return this._world_to_object;
	}

	private setDirty(): void {
		this._dirty = true;
	}

	private updateMatrix(): void {
		if (this._dirty) {
			mat4.fromRotationTranslationScale(this._object_to_world, this._rotation, this._translation, this._scale);
			mat4.invert(this._world_to_object, this._object_to_world);
			this._dirty = false;
		}
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

	get scale(): vec3 {
		return this._transform.scale;
	}

	set scale(units: vec3) {
		this._transform.scale = units;
	}

	get world_axis_x(): vec3 {
		return this._transform.world_axis_x;
	}

	get world_axis_y(): vec3 {
		return this._transform.world_axis_y;
	}

	get world_axis_z(): vec3 {
		return this._transform.world_axis_z;
	}

	get world_origin(): vec3 {
		return this._transform.world_origin;
	}

	get object_to_world_matrix(): mat4 {
		return this._transform.object_to_world_matrix;
	}

	get world_to_object_matrix(): mat4 {
		return this._transform.world_to_object_matrix;
	}
}