import { vec2, vec3, vec4 } from "gl-matrix";

export enum VertexLocations {
	POSITION = 0,
	NORMAL   = 1,
	COLOR    = 2,
	TEXCOORD = 3,
}

export class VertexDesc {
	semantic_name: string;
	location: number;
	size: number;
	type: number;
	normalize: boolean;
	stride: number;
	offset: number;

	constructor(name: string, location: number, size: number, type: number, normalize: boolean, stride: number, offset: number) {
		this.semantic_name = name;
		this.location = location;
		this.size = size;
		this.type = type;
		this.normalize = normalize;
		this.stride = stride;
		this.offset = offset;
	}

	bind(context: WebGL2RenderingContext): void {
		context.enableVertexAttribArray(this.location);
		context.vertexAttribPointer(this.location, this.size, this.type, this.normalize, this.stride, this.offset);
	}
}

export interface Vertex {
	[key: string]: any;
	readonly vertex_descs: VertexDesc[];
	position: vec3;
}

export class VertexPosition implements Vertex {
	private static readonly _vertex_descs: VertexDesc[] = [
		new VertexDesc("in_position", VertexLocation.POSITION, 3, WebGL2RenderingContext.FLOAT, false, 3*Float32Array.BYTES_PER_ELEMENT, 0),
	];

	position: vec3 = vec3.create();

	constructor(position: vec3 | number[]) {
		vec3.copy(this.position, position);
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPosition._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPosition._vertex_descs;
	}
}

export class VertexPositionColor implements Vertex {
	private static readonly _vertex_descs: VertexDesc[] = [
		new VertexDesc("in_position", VertexLocation.POSITION, 3, WebGL2RenderingContext.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0),
		new VertexDesc("in_color",    VertexLocation.COLOR,    3, WebGL2RenderingContext.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT),
	];

	position: vec3 = vec3.create();
	color: vec3 = vec3.create();

	constructor(position: vec3 | number[], color: vec3 | number[]) {
		vec3.copy(this.position, position);
		vec3.copy(this.color, color);
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPositionColor._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPositionColor._vertex_descs;
	}
}

export class VertexPositionNormalColor implements Vertex {
	private static readonly _vertex_descs: VertexDesc[] = [
		new VertexDesc("in_position", VertexLocation.POSITION, 3, WebGL2RenderingContext.FLOAT, false, 9*Float32Array.BYTES_PER_ELEMENT, 0),
		new VertexDesc("in_normal",   VertexLocation.NORMAL,   3, WebGL2RenderingContext.FLOAT, true,  9*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT),
		new VertexDesc("in_color",    VertexLocation.COLOR,    3, WebGL2RenderingContext.FLOAT, false, 9*Float32Array.BYTES_PER_ELEMENT, 6*Float32Array.BYTES_PER_ELEMENT),
	];

	position: vec3 = vec3.create();
	normal: vec3 = vec3.create();
	color: vec3 = vec3.create();

	constructor(position: vec3 | vec3 | number[], normal: vec3 | number[], color: vec3 | number[]) {
		vec3.copy(this.position, position);
		vec3.copy(this.normal, normal);
		vec3.copy(this.color, color);
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPositionNormalColor._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPositionNormalColor._vertex_descs;
	}
}

export class VertexPositionNormalTexture implements Vertex {
	private static _vertex_descs: VertexDesc[] = [
		new VertexDesc("in_position", VertexLocation.POSITION, 3, WebGL2RenderingContext.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 0),
		new VertexDesc("in_normal",   VertexLocation.NORMAL,   3, WebGL2RenderingContext.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT),
		new VertexDesc("in_texcoord", VertexLocation.TEXCOORD, 2, WebGL2RenderingContext.FLOAT, false, 8*Float32Array.BYTES_PER_ELEMENT, 6*Float32Array.BYTES_PER_ELEMENT),
	];

	position: vec3 = vec3.create();
	normal: vec3 = vec3.create();
	texcoord: vec2 = vec2.create();

	constructor(position: vec3 | vec3 | number[], normal: vec3 | number[], texcoord: vec2 | number[]) {
		vec3.copy(this.position, position);
		vec3.copy(this.normal, normal);
		vec2.copy(this.texcoord, texcoord);
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPositionNormalTexture._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPositionNormalTexture._vertex_descs;
	}
}


export function VertexArrayToFloat32Array(vertex_array: Vertex[]): Float32Array {
	var data: number[] = [];
	vertex_array.forEach((vertex: Vertex) => {
		//data.push(...Object.values(vertex).flat());
		const values: Float32Array[] = Object.keys(vertex).map((key: string) => vertex[key]);
		values.forEach((value: Float32Array) => {
			data.push(...value);
		});
	});
	return new Float32Array(data);
}