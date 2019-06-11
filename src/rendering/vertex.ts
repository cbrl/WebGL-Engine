class VertexDesc {
	semantic_name: string;
	size: number;
	type: number;
	normalize: boolean;
	stride: number;
	offset: number;

	constructor(name: string, size: number, type: number, normalize: boolean, stride: number, offset: number) {
		this.semantic_name = name;
		this.size = size;
		this.type = type;
		this.normalize = normalize;
		this.stride = stride;
		this.offset = offset;
	}

	bind(context: WebGLRenderingContext, program: WebGLProgram): void {
		var attrib_location = context.getAttribLocation(program, this.semantic_name);
		context.enableVertexAttribArray(attrib_location);
		context.vertexAttribPointer(attrib_location, this.size, this.type, this.normalize, this.stride, this.offset);
	}
}

interface Vertex {
	[key: string]: any;
	vertex_descs: VertexDesc[];
	position: [number, number, number];
}

class VertexPosition implements Vertex {
	private static _vertex_descs: VertexDesc[] = [
		new VertexDesc("a_position", 3, WebGLRenderingContext.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0),
	];

	position: [number, number, number];

	constructor(position: [number, number, number]) {
		this.position = position;
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPosition._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPosition._vertex_descs;
	}
}

class VertexPositionColor implements Vertex {
	private static _vertex_descs: VertexDesc[] = [
		new VertexDesc("a_position", 3, WebGLRenderingContext.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 0),
		new VertexDesc("a_color",    3, WebGLRenderingContext.FLOAT, false, 6*Float32Array.BYTES_PER_ELEMENT, 3*Float32Array.BYTES_PER_ELEMENT),
	];

	position: [number, number, number];
	color: [number, number, number];

	constructor(position: [number, number, number], color: [number, number, number]) {
		this.position = position;
		this.color = color;
	}

	static get vertex_descs(): VertexDesc[] {
		return VertexPositionColor._vertex_descs;
	}

	get vertex_descs(): VertexDesc[] {
		return VertexPositionColor._vertex_descs;
	}
}


function VertexArrayToFloat32Array(vertex_array: Vertex[]): Float32Array {
	var data: number[] = [];
	vertex_array.forEach((vertex: Vertex) => {
		//data.push(...Object.values(vertex).flat());
		const values: number[][] = Object.keys(vertex).map((key: string) => vertex[key]);
		values.forEach((value: number[]) => {
			data.push(...value);
		});
	});
	return new Float32Array(data);
}


export {
	VertexDesc,
	Vertex,
	VertexPosition,
	VertexPositionColor,
	VertexArrayToFloat32Array,
};