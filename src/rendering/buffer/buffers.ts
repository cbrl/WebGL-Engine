import { vec2, vec3, mat4 } from "gl-matrix";

export enum UniformBufferLocations {
	CAMERA = 0,
	MODEL  = 1,
	LIGHT  = 2,
}

export interface Buffer {
	readonly size: number;
	readonly numElements: number;
	data: ArrayBufferView;
}

export class CameraBuffer implements Buffer {
	private static readonly _length: number = 4 * 16;
	private static readonly _size: number = CameraBuffer._length * Float32Array.BYTES_PER_ELEMENT;

	camera_to_world: mat4 = mat4.create();
	world_to_camera: mat4 = mat4.create();
	camera_to_projection: mat4 = mat4.create();
	projection_to_camera: mat4 = mat4.create();

	static get size(): number {
		return CameraBuffer._size;
	}
	get size(): number {
		return CameraBuffer._size;
	}

	static get numElements(): number {
		return CameraBuffer._length;
	}
	get numElements(): number {
		return CameraBuffer._length;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		out.set(this.camera_to_world, offset);
		offset += 16;
		
		out.set(this.world_to_camera, offset);
		offset += 16;

		out.set(this.camera_to_projection, offset);
		offset += 16;

		out.set(this.projection_to_camera, offset);
		offset += 16;

		return out;
	}
}

export class ModelBuffer implements Buffer {
	private static readonly _length: number = 3 * 16;
	private static readonly _size: number = ModelBuffer._length * Float32Array.BYTES_PER_ELEMENT;
	
	world: mat4 = mat4.create();
	world_inv_transpose: mat4 = mat4.create();
	tex_transform: mat4 = mat4.create();

	static get size(): number {
		return ModelBuffer._size;
	}
	get size(): number {
		return ModelBuffer._size;
	}

	static get numElements(): number {
		return ModelBuffer._length;
	}
	get numElements(): number {
		return ModelBuffer._length;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		out.set(this.world, offset);
		offset += 16;

		out.set(this.world_inv_transpose, offset);
		offset += 16;

		out.set(this.tex_transform, offset);
		offset += 16;

		return out;
	}
}

export class DirectionalLightBuffer {
	private static readonly _length: number = 24;
	private static readonly _size: number = DirectionalLightBuffer._length * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3 = vec3.create();
	pad0: number = 0;
	direction: vec3 = vec3.create();
	pad1: number = 0;
	world_to_projection: mat4 = mat4.create();

	static get size(): number {
		return DirectionalLightBuffer._size;
	}
	get size(): number {
		return DirectionalLightBuffer._size;
	}

	static get numElements(): number {
		return DirectionalLightBuffer._length;
	}
	get numElements(): number {
		return DirectionalLightBuffer._length;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += 3;

		out.set([0], offset);
		offset += 1;

		out.set(this.direction, offset);
		offset += 3;
		
		out.set([0], offset);
		offset += 1;

		out.set(this.world_to_projection, offset);
		offset += 16;
		
		return out;
	}
}

export class PointLightBuffer {
	private static readonly _length: number = 12;
	private static readonly _size: number = PointLightBuffer._length * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3 = vec3.create();
	pad0: number = 0;
	position: vec3 = vec3.create();
	range: number = 0;
	attenuation: vec3 = vec3.create();
	pad1: number = 0;

	static get size(): number {
		return PointLightBuffer._size;
	}
	get size(): number {
		return PointLightBuffer._size;
	}

	static get numElements(): number {
		return PointLightBuffer._length;
	}
	get numElements(): number {
		return PointLightBuffer._length;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += 3;

		out.set([0], offset);
		offset += 1;

		out.set(this.position, offset);
		offset += 3;

		out.set([this.range], offset);
		offset += 1;

		out.set(this.attenuation, offset);
		offset += 3;

		out.set([0], offset);
		offset += 1;
		
		return out;
	}
}

export class SpotLightBuffer {
	private static readonly _length: number = 16;
	private static readonly _size: number = SpotLightBuffer._length * Float32Array.BYTES_PER_ELEMENT;

	intensity: vec3 = vec3.create();
	pad0: number = 0;
	position: vec3 = vec3.create();
	range: number = 0;
	direction: vec3 = vec3.create();
	cos_umbra: number = 0;
	attenuation: vec3 = vec3.create();
	cos_penumbra: number = 0;

	static get size(): number {
		return SpotLightBuffer._size;
	}
	get size(): number {
		return SpotLightBuffer._size;
	}

	static get numElements(): number {
		return SpotLightBuffer._length;
	}
	get numElements(): number {
		return SpotLightBuffer._length;
	}

	get data(): Float32Array {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		out.set(this.intensity, offset);
		offset += 3;

		out.set([0], offset);
		offset += 1;

		out.set(this.position, offset);
		offset += 3;

		out.set([this.range], offset);
		offset += 1;

		out.set(this.direction, offset);
		offset += 3;

		out.set([this.cos_umbra], offset);
		offset += 1;

		out.set(this.attenuation, offset);
		offset += 3;

		out.set([this.cos_penumbra], offset);
		offset += 1;
		
		return out;
	}
}
export class LightBuffer implements Buffer {
	static readonly max_directional_lights = 8;
	static readonly max_point_lights = 8;
	static readonly max_spot_lights = 8;

	private static readonly _length: number = (LightBuffer.max_directional_lights * DirectionalLightBuffer.numElements)
	                                           + (LightBuffer.max_point_lights * PointLightBuffer.numElements)
	                                           + (LightBuffer.max_spot_lights * SpotLightBuffer.numElements)
											   + 4;
											   
	private static readonly _size: number = LightBuffer._length * Float32Array.BYTES_PER_ELEMENT;

	directional_lights: DirectionalLightBuffer[] = new Array<DirectionalLightBuffer>();
	point_lights: PointLightBuffer[] = new Array<PointLightBuffer>();
	spot_lights: SpotLightBuffer[] = new Array<SpotLightBuffer>();

	num_directional_lights: number = 0;
	num_point_lights: number = 0;
	num_spot_lights: number = 0;
	pad0: number = 0;

	static get size(): number {
		return LightBuffer._size;
	}
	get size(): number {
		return LightBuffer._size;
	}

	static get numElements(): number {
		return LightBuffer._length;
	}
	get numElements(): number {
		return LightBuffer._length;
	}

	get data(): ArrayBufferView {
		var out: Float32Array = new Float32Array(this.numElements);
		var offset: number = 0;

		// Directional Lights
		for (let buffer of this.directional_lights) {
			out.set(buffer.data, offset);
			offset += buffer.numElements;
		}
		for (let i = 0; i < (8 - this.directional_lights.length); ++i) {
			out.set(new Float32Array(DirectionalLightBuffer.numElements), offset);
			offset += DirectionalLightBuffer.numElements;
		}

		// Point Lights
		for (let buffer of this.point_lights) {
			out.set(buffer.data, offset);
			offset += buffer.numElements;
		}
		for (let i = 0; i < (8 - this.point_lights.length); ++i) {
			out.set(new Float32Array(PointLightBuffer.numElements), offset);
			offset += PointLightBuffer.numElements;
		}

		// Spot Lights
		for (let buffer of this.spot_lights) {
			out.set(buffer.data, offset);
			offset += buffer.numElements;
		}
		for (let i = 0; i < (8 - this.spot_lights.length); ++i) {
			out.set(new Float32Array(SpotLightBuffer.numElements), offset);
			offset += SpotLightBuffer.numElements;
		}

		out.set([this.directional_lights.length], offset);
		offset += 1;

		out.set([this.point_lights.length], offset);
		offset += 1;

		out.set([this.spot_lights.length], offset);
		offset += 1;

		out.set([0], offset);
		offset += 1;

		return out;
	}
}