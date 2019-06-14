import { Component } from "../ecs";
import { Vertex, VertexArrayToFloat32Array } from "../rendering/vertex";

export class Model extends Component {
	primitive_type: number;
	private _vertex_buffer: WebGLBuffer;
	private _vertex_count: number;

	constructor(context: WebGL2RenderingContext, vertices: Vertex[], primitive_type: number = WebGL2RenderingContext.TRIANGLES) {
		super();
		this.primitive_type = primitive_type;
		this._vertex_buffer = context.createBuffer();
		this._vertex_count = vertices.length;
		context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._vertex_buffer);
		context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, VertexArrayToFloat32Array(vertices), WebGL2RenderingContext.STATIC_DRAW);
	}

	destroyBuffer(context: WebGL2RenderingContext): void {
		context.deleteBuffer(this._vertex_buffer);
	}

	bindVertexBuffer(context: WebGL2RenderingContext): void {
		context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._vertex_buffer);
	}

	render(context: WebGL2RenderingContext): void {
		var offset = 0;
		context.drawArrays(this.primitive_type, offset, this._vertex_count);
	}
}