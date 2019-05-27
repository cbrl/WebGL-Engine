import { Transform } from "./transform";
import { Vertex, VertexArrayToFloat32Array } from "./vertex";

export class Shape {
	public transform: Transform = new Transform();
	public primitive_type: number;
	private _vertex_buffer: WebGLBuffer;
	private _vertex_count: number;

	constructor(context: WebGLRenderingContext, vertices: Vertex[], primitive_type: number = WebGLRenderingContext.TRIANGLES) {
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