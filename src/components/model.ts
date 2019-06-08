import { Component } from "../ecs";
import { Vertex, VertexArrayToFloat32Array } from "../rendering/vertex";

export class Model extends Component {
	primitive_type: number;
	_vertex_buffer: WebGLBuffer;
	_vertex_count: number;

	constructor(context: WebGLRenderingContext, vertices: Vertex[], primitive_type: number = WebGLRenderingContext.TRIANGLES) {
		super();
		this.primitive_type = primitive_type;
		this._vertex_buffer = context.createBuffer();
		this._vertex_count = vertices.length;
		context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this._vertex_buffer);
		context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, VertexArrayToFloat32Array(vertices), WebGLRenderingContext.STATIC_DRAW);
	}

	bindVertexBuffer(context: WebGLRenderingContext): void {
		context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, this._vertex_buffer);
	}

	render(context: WebGLRenderingContext): void {
		var offset = 0;
		context.drawArrays(this.primitive_type, offset, this._vertex_count);
	}
}