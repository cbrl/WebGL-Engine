import { VertexDesc } from "./vertex";

class Shader {
	_shader: WebGLShader;

	constructor(context: WebGLRenderingContext, type: number, source: string) {
		var shader: WebGLShader = context.createShader(type);
		context.shaderSource(shader, source);
		context.compileShader(shader);
		const success = context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS);
		if (success) {
			this._shader = shader;
		}
		else {
			console.error("Shader compile error: ", context.getShaderInfoLog(shader));
			context.deleteShader(shader);
		}
	}

	getShader(): WebGLShader {
		return this._shader;
	}
}


class VertexShader extends Shader {
	constructor(context: WebGLRenderingContext, source: string) {
		super(context, WebGLRenderingContext.VERTEX_SHADER, source);
	}
}


class FragmentShader extends Shader {
	constructor(context: WebGLRenderingContext, source: string) {
		super(context, WebGLRenderingContext.FRAGMENT_SHADER, source);
	}
}


class Program {
	private _vertex_descs: VertexDesc[] = [];
	private _vertex_shader: VertexShader;
	private _fragment_shader: FragmentShader;
	private _program: WebGLProgram;

	constructor(context: WebGLRenderingContext, vertex_shader: VertexShader, fragment_shader: FragmentShader, vertex_descs: VertexDesc[]) {
		this._vertex_descs = vertex_descs;
		this._vertex_shader = vertex_shader;
		this._fragment_shader = fragment_shader;
		this.createProgram(context);
	}

	createProgram(context: WebGLRenderingContext): void {
		var program: WebGLProgram = context.createProgram();
		context.attachShader(program, this._vertex_shader.getShader());
		context.attachShader(program, this._fragment_shader.getShader());
		
		context.linkProgram(program);
		const link_success = context.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS);
		if (!link_success) {
			console.error("Program link error: ", context.getProgramInfoLog(program));
			context.deleteProgram(program);
			return;
		}

		context.validateProgram(program);
		const validate_success = context.getProgramParameter(program, WebGLRenderingContext.VALIDATE_STATUS);
		if (!validate_success) {
			console.error("Program validation error: ", context.getProgramInfoLog(program));
			context.deleteProgram(program);
			return;
		}

		this._program = program;
	}

	getProgram(): WebGLProgram {
		return this._program;
	}

	bindProgram(context: WebGLRenderingContext): void {
		context.useProgram(this._program);
	}
	
	bindVertexDescs(context: WebGLRenderingContext): void {
		for (const desc of this._vertex_descs) {
			desc.bind(context, this._program);
		}
	}
}


export {
	VertexShader,
	FragmentShader,
	Program
};