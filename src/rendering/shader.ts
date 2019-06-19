import { UniformBuffer } from "./buffer/uniform_buffer";

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
	private _uniform_locations: Map<string, WebGLUniformLocation> = new Map();
	private static _uniform_buffers: Map<string, UniformBuffer> = new Map();

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

	updateUniformvalue(context: WebGL2RenderingContext, gl_update_func: Function, name: string, value: any): void {
		this.bindProgram(context);
		var location: WebGLUniformLocation = this._uniform_locations.get(name)
		if (!location) {
			location = context.getUniformLocation(this.gl_program, name);
			this._uniform_locations.set(name, location);
		}
		if (location != WebGL2RenderingContext.INVALID_INDEX) {
			gl_update_func.call(context, location, value);
		}
	}

	// Create a global uniform buffer
	addUniformBuffer(context: WebGL2RenderingContext, name: string, size: number, slot: number): void {
		if (!Program._uniform_buffers.get(name)) {
			Program._uniform_buffers.set(name, new UniformBuffer(context, size, slot));
		}
		const index = context.getUniformBlockIndex(this._program, name);
		if (index != WebGL2RenderingContext.INVALID_INDEX)
			context.uniformBlockBinding(this._program, index, slot);
	}

	// Update the data of a global uniform buffer
	updateUniformBuffer<T extends ArrayBufferView>(context: WebGL2RenderingContext, name: string, data: T): void {
		Program.updateUniformBuffer(context, name, data);
	}

	static updateUniformBuffer<T extends ArrayBufferView>(context: WebGL2RenderingContext, name: string, data: T): void {
		var buffer: UniformBuffer = Program._uniform_buffers.get(name);
		if (buffer) {
			buffer.updateData(context, data);
		}
		else {
			console.warn("Attempting to update data of uniform \"" + name + "\", but it has not yet been added with Program.addUniformBuffer().");
		}
	}
}
