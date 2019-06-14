import { mat4 } from "gl-matrix";

export enum ShaderBindings {
	SLOT_UBO_CAMERA = 0,
	SLOT_UBO_MODEL  = 1,
	SLOT_UBO_LIGHT  = 2,
}

export interface Buffer {
	readonly size: number;
	data: ArrayBufferView;
}

export class CameraBuffer implements Buffer {
	private static readonly _size: number = 2 * 16 * Float32Array.BYTES_PER_ELEMENT;

	world_to_camera: mat4 = mat4.create();
	camera_to_projection: mat4 = mat4.create();

	static get size(): number {
		return CameraBuffer._size;
	}

	get size(): number {
		return CameraBuffer._size;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		out.set(this.world_to_camera, offset);
		offset += this.world_to_camera.length;

		out.set(this.camera_to_projection, offset);

		return out;
	}
}

export class ModelBuffer implements Buffer {
	private static readonly _size: number = 3 * 16 * Float32Array.BYTES_PER_ELEMENT;
	
	world: mat4 = mat4.create();
	world_inv_transpose: mat4 = mat4.create();
	tex_transform: mat4 = mat4.create();

	static get size(): number {
		return ModelBuffer._size;
	}

	get size(): number {
		return ModelBuffer._size;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		out.set(this.world, offset);
		offset += this.world.length;

		out.set(this.world_inv_transpose, offset);
		offset += this.world_inv_transpose.length;

		out.set(this.tex_transform, offset);

		return out;
	}
}