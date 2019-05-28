import { RenderingMgr } from "./rendering_mgr";
import { Scene, TestScene } from "./scene";

export class Engine {
	private static _instance: Engine = new Engine();

	_running: boolean;
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
			Engine.setScene(new TestScene());
			Engine.run();
		});
	}

	//--------------------------------------------------------------------------------
	// Static methods
	//--------------------------------------------------------------------------------

	static get rendering_mgr(): RenderingMgr {
		return Engine._instance.rendering_mgr;
	}

	static get scene(): Scene {
		return Engine._instance.scene;
	}

	static setScene(scene: Scene): void {
		Engine._instance.scene = scene;
	}

	static run(): void {
		Engine._instance.run();
	}

	static stop(): void {
		Engine._instance.stop();
	}

	//--------------------------------------------------------------------------------
	// Member methods
	//--------------------------------------------------------------------------------

	private get rendering_mgr(): RenderingMgr {
		return this._rendering_mgr;
	}

	private get scene(): Scene {
		return this._scene;
	}

	private set scene(scene: Scene) {
		if (Engine._instance._scene)
			Engine._instance._scene.unload();
			
		Engine._instance._scene = scene;
		Engine._instance._scene.load();
	}

	private run(): void {
		Engine._instance._running = true;
		window.requestAnimationFrame(Engine._instance.update.bind(Engine._instance));
	}

	private stop(): void {
		Engine._instance._running = false;
	}

	private update(): void {
		if (this._scene)
			this._scene.update();

		this.render();

		if (this._running)
			window.requestAnimationFrame(this.update.bind(this));
	}

	private render(): void {
		if (this._scene)
			this._rendering_mgr.render(this._scene);
	}
}