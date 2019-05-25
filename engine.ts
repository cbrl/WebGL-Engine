import { RenderingMgr } from "./rendering_mgr";
import { Scene } from "./scene";

export class Engine {
	static instance: Engine = new Engine();

	_canvas: HTMLCanvasElement;
	_rendering_mgr: RenderingMgr;
	_scene: Scene;

	constructor() {
		this._canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
		this._rendering_mgr = new RenderingMgr(this._canvas);

		var button: HTMLElement = document.createElement("button");
		document.body.appendChild(button);
		button.textContent = "Load Scene";
		button.addEventListener("click", () => {
			Engine.setScene(new Scene());
			this.render();
		});
	}

	static setScene(scene: Scene): void {
		Engine.instance._scene = scene;
		Engine.instance._scene.load();
	}

	private render(): void {
		this._rendering_mgr.render(this._scene);
	}

	static get rendering_mgr(): RenderingMgr {
		return Engine.instance._rendering_mgr;
	}

	static get scene(): Scene {
		return Engine.instance._scene;
	}
}