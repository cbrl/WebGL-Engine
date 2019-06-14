import { UniformBuffer } from "./uniform_buffer";

abstract class Shader {
	private _shader: WebGLShader;

	constructor(context: WebGL2RenderingContext, type: number, source: string) {
		var shader: WebGLShader = context.createShader(type);
		context.shaderSource(shader, source);
		context.compileShader(shader);
		const success = context.getShaderParameter(shader, WebGL2RenderingContext.COMPILE_STATUS);
		if (success) {
			this._shader = shader;
		}
		else {
			console.error("Shader compile error: ", context.getShaderInfoLog(shader));
			context.deleteShader(shader);
		}
	}

	get gl_shader(): WebGLShader {
		return this._shader;
	}
}


export class VertexShader extends Shader {
	constructor(context: WebGL2RenderingContext, source: string) {
		super(context, WebGL2RenderingContext.VERTEX_SHADER, source);
	}
}


export class FragmentShader extends Shader {
	constructor(context: WebGL2RenderingContext, source: string) {
		super(context, WebGL2RenderingContext.FRAGMENT_SHADER, source);
	}
}


export class Program {
	private _vertex_shader: VertexShader;
	private _fragment_shader: FragmentShader;
	private _program: WebGLProgram;
	private _buffers: Map<string, UniformBuffer> = new Map();

	constructor(context: WebGL2RenderingContext, vertex_shader: VertexShader, fragment_shader: FragmentShader) {
		this._vertex_shader = vertex_shader;
		this._fragment_shader = fragment_shader;
		this.createProgram(context);
	}

	createProgram(context: WebGL2RenderingContext): void {
		var program: WebGLProgram = context.createProgram();
		context.attachShader(program, this._vertex_shader.gl_shader);
		context.attachShader(program, this._fragment_shader.gl_shader);
		
		context.linkProgram(program);
		const link_success = context.getProgramParameter(program, WebGL2RenderingContext.LINK_STATUS);
		if (!link_success) {
			console.error("Program link error: ", context.getProgramInfoLog(program));
			context.deleteProgram(program);
			return;
		}

		context.validateProgram(program);
		const validate_success = context.getProgramParameter(program, WebGL2RenderingContext.VALIDATE_STATUS);
		if (!validate_success) {
			console.error("Program validation error: ", context.getProgramInfoLog(program));
			context.deleteProgram(program);
			return;
		}

		this._program = program;
	}

	destroyProgram(context: WebGL2RenderingContext): void {
		if (this._program) {
			context.deleteProgram(this._program);
		}
	}

	get gl_program(): WebGLProgram {
		return this._program;
	}

	bindProgram(context: WebGL2RenderingContext): void {
		context.useProgram(this._program);
	}

	addUniform(context: WebGL2RenderingContext, name: string, size: number, slot: number): void {
		if (!this._buffers.get(name)) {
			this._buffers.set(name, new UniformBuffer(context, size, slot));
			const index: number = context.getUniformBlockIndex(this._program, name);
			context.uniformBlockBinding(this._program, index, slot);
		}
		else {
			console.warn("Attempting to add uniform \"" + name + "\", but one already exits with that name.");
		}
	}

	updateUniform<T extends ArrayBufferView>(context: WebGL2RenderingContext, name: string, data: T): void {
		var buffer: UniformBuffer = this._buffers.get(name);
		if (buffer) {
			buffer.updateData(context, data);
		}
		else {
			console.warn("Attempting to update data of uniform \"" + name + "\", but it has not yet been added with Program.addUniform().");
		}
	}
}
