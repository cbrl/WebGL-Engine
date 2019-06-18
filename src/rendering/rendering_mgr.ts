import { Scene } from "./scene";
import { Renderer } from "./renderer/renderer";


class WebGL {
	private _context: WebGL2RenderingContext;

	constructor(canvas: HTMLCanvasElement) {
		this._context = <WebGL2RenderingContext>canvas.getContext("webgl2");
		if (!this._context) {
			console.error("WebGL2 not supported");
		}

		this._context.viewport(0, 0, this._context.canvas.width, this._context.canvas.height);
		this._context.scissor(0, 0, this._context.canvas.width, this._context.canvas.height);

		this._context.clearColor(0, 0.6, 1.0, 1.0);

		this._context.enable(WebGL2RenderingContext.CULL_FACE);
		this._context.enable(WebGL2RenderingContext.SCISSOR_TEST);
		this._context.enable(WebGL2RenderingContext.DEPTH_TEST);
	}

	get context(): WebGL2RenderingContext {
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
		this._web_gl.context.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);

		// Render scene
		this._renderer.render(scene);
	}

	get context(): WebGL2RenderingContext {
		return this._web_gl.context;
	}
}