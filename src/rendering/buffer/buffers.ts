import { vec2, vec3, mat4 } from "gl-matrix";

export enum UniformBufferLocations {
	CAMERA = 0,
	MODEL  = 1,
	LIGHT  = 2,
}

export interface Buffer {
	readonly size: number;
	//readonly length: number;
	data: ArrayBufferView;
}

export class CameraBuffer implements Buffer {
	private static readonly _length: number = 2 * 16;
	private static readonly _size: number = CameraBuffer._length * Float32Array.BYTES_PER_ELEMENT;

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

export class DirectionalLightBuffer {
	private static readonly _size: number = 24 * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3;
	pad0: number;
	direction: vec3;
	pad1: number;
	world_to_projection: mat4;

	static get size(): number {
		return DirectionalLightBuffer._size;
	}

	get size(): number {
		return DirectionalLightBuffer._size;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += this.intensity.length;

		out.set([0], offset);
		offset += 1;

		out.set(this.direction, offset);
		offset += this.direction.length;

		out.set([0], offset);
		offset += 1;

		out.set(this.world_to_projection, offset);
		
		return out;
	}
}

export class PointLightBuffer {
	private static readonly _size: number = 12 * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3;
	pad0: number;
	position: vec3;
	range: number;
	attenuation: vec3;
	pad1: number;

	static get size(): number {
		return PointLightBuffer._size;
	}

	get size(): number {
		return PointLightBuffer._size;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += this.intensity.length;

		out.set([0], offset);
		offset += 1;

		out.set(this.position, offset);
		offset += this.position.length;

		out.set([this.range], offset);
		offset += 1;

		out.set(this.attenuation, offset);
		offset += this.attenuation.length;

		out.set([0], offset);
		
		return out;
	}
}

export class SpotLightBuffer {
	private static readonly _size: number = 16 * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3;
	pad0: number;
	position: vec3;
	range: number;
	direction: vec3;
	cos_umbra: number;
	cos_penumbra: number;
	attenuation: vec3;

	static get size(): number {
		return SpotLightBuffer._size;
	}

	get size(): number {
		return SpotLightBuffer._size;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += this.intensity.length;

		out.set([0], offset);
		offset += 1;

		out.set(this.position, offset);
		offset += this.position.length;

		out.set([this.range], offset);
		offset += 1;

		out.set(this.direction, offset);
		offset += this.direction.length;

		out.set([this.cos_umbra], offset);
		offset += 1;

		out.set(this.attenuation, offset);
		offset += this.attenuation.length;

		out.set([this.cos_penumbra], offset);
		offset += 1;
		
		return out;
	}
}
export class LightBuffer implements Buffer {
	static readonly max_directional_lights = 8;
	static readonly max_point_lights = 8;
	static readonly max_spot_lights = 8;

	private static readonly _size: number = (4 * Float32Array.BYTES_PER_ELEMENT)
	                                        + (LightBuffer.max_directional_lights * DirectionalLightBuffer.size)
	                                        + (LightBuffer.max_point_lights * PointLightBuffer.size)
	                                        + (LightBuffer.max_spot_lights * SpotLightBuffer.size);

	directional_lights: DirectionalLightBuffer[] = new Array<DirectionalLightBuffer>();
	point_lights: PointLightBuffer[] = new Array<PointLightBuffer>();
	spot_lights: SpotLightBuffer[] = new Array<SpotLightBuffer>();

	num_directional_lights: number;
	num_point_lights: number;
	num_spot_lights: number;
	pad0: number;

	static get size(): number {
		return LightBuffer._size;
	}

	get size(): number {
		return LightBuffer._size;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.size / Float32Array.BYTES_PER_ELEMENT);
		var offset: number = 0;

		for (let buffer of this.directional_lights) {
			out.set(buffer.data, offset);
			offset += buffer.size / Float32Array.BYTES_PER_ELEMENT;
		}
		for (let i = 0; i < (8 - this.directional_lights.length); ++i) {
			out.set(new Float32Array(DirectionalLightBuffer.size / Float32Array.BYTES_PER_ELEMENT), offset);
			offset += DirectionalLightBuffer.size / Float32Array.BYTES_PER_ELEMENT;
		}

		for (let buffer of this.point_lights) {
			out.set(buffer.data, offset);
			offset += buffer.size / Float32Array.BYTES_PER_ELEMENT;
		}
		for (let i = 0; i < (8 - this.point_lights.length); ++i) {
			out.set(new Float32Array(PointLightBuffer.size / Float32Array.BYTES_PER_ELEMENT), offset);
			offset += PointLightBuffer.size / Float32Array.BYTES_PER_ELEMENT;
		}

		for (let buffer of this.spot_lights) {
			out.set(buffer.data, offset);
			offset += buffer.size / Float32Array.BYTES_PER_ELEMENT;
		}
		for (let i = 0; i < (8 - this.spot_lights.length); ++i) {
			out.set(new Float32Array(SpotLightBuffer.size / Float32Array.BYTES_PER_ELEMENT), offset);
			offset += SpotLightBuffer.size / Float32Array.BYTES_PER_ELEMENT;
		}

		out.set([this.directional_lights.length], offset);
		offset += 1;

		out.set([this.point_lights.length], offset);
		offset += 1;

		out.set([this.spot_lights.length], offset);
		offset += 1;

		out.set([0], offset);

		return out;
	}
}