import { Component } from "../ecs";
import { Vertex, VertexArrayToFloat32Array } from "../rendering/vertex";
import { UniformBuffer } from "../rendering/uniform_buffer";
import { ShaderBindings, ModelBuffer } from "../rendering/buffer/buffers";
import { mat4 } from "gl-matrix";

export class Model extends Component {
	primitive_type: number;
	private _vertex_buffer: WebGLBuffer;
	private _vertex_count: number;
	//private _model_buffer: UniformBuffer;

	constructor(context: WebGL2RenderingContext, vertices: Vertex[], primitive_type: number = WebGL2RenderingContext.TRIANGLES) {
		super();
		this.primitive_type = primitive_type;
		this._vertex_buffer = context.createBuffer();
		this._vertex_count = vertices.length;
		//this._model_buffer = new UniformBuffer(context, ModelBuffer.size, ShaderBindings.SLOT_UBO_MODEL);
		context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._vertex_buffer);
		context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, VertexArrayToFloat32Array(vertices), WebGL2RenderingContext.STATIC_DRAW);
	}

	destroyBuffers(context: WebGL2RenderingContext): void {
		context.deleteBuffer(this._vertex_buffer);
		//this._model_buffer.destroyBuffer(context);
	}

	// updateModelBuffer(context: WebGL2RenderingContext, world: mat4, tex_transform: mat4): void {
	// 	var buffer: ModelBuffer = new ModelBuffer;
	// 	buffer.world = world;
	// 	buffer.tex_transform = tex_transform;
	// 	mat4.invert(buffer.world_inv_transpose, world);
	// 	mat4.transpose(buffer.world_inv_transpose, buffer.world_inv_transpose);
	// 	this._model_buffer.updateData(context, buffer.data);
	// }

	bindVertexBuffer(context: WebGL2RenderingContext): void {
		context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this._vertex_buffer);
	}

	render(context: WebGL2RenderingContext): void {
		var offset = 0;
		context.drawArrays(this.primitive_type, offset, this._vertex_count);
	}
}