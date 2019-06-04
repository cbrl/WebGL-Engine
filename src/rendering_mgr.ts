import { Scene } from "./scene";
import { Renderer } from "./renderer";


class WebGL {
	private _context: WebGLRenderingContext;

	constructor(canvas: HTMLCanvasElement) {
		this._context = canvas.getContext("webgl");

		this._context.viewport(0, 0, this._context.canvas.width, this._context.canvas.height);
		this._context.scissor(0, 0, this._context.canvas.width, this._context.canvas.height);

		this._context.clearColor(0, 0.6, 1.0, 1.0);

		this._context.enable(WebGLRenderingContext.CULL_FACE);
		this._context.enable(WebGLRenderingContext.SCISSOR_TEST);
		this._context.enable(WebGLRenderingContext.DEPTH_TEST);
	}

	get context(): WebGLRenderingContext {
		return this._context;
	}
}


export class RenderingMgr {
	private _web_gl: WebGL;
	private _renderer: Renderer;

	constructor(canvas: HTMLCanvasElement) {
		this._web_gl = new WebGL(canvas);
		this._renderer = new Renderer(this._web_gl.context);
	}

	render(scene: Scene): void {
		// Clear buffer
		this._web_gl.context.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);

		// Render scene
		this._renderer.render(scene);
	}

	get context(): WebGLRenderingContext {
		return this._web_gl.context;
	}
}