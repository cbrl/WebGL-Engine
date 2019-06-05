import { RenderingMgr } from "./rendering_mgr";
import { Scene, TestScene } from "./scene";

export class Engine {
	private static _instance: Engine = new Engine();

	private _running: boolean = false;
	private _canvas: HTMLCanvasElement;
	private _rendering_mgr: RenderingMgr;
	private _scene: Scene;

	private _prev_time: DOMHighResTimeStamp;
	private _delta_time_ms: number = 0;

	constructor() {
		this._canvas = <HTMLCanvasElement>document.getElementById("gl_canvas");
		this._rendering_mgr = new RenderingMgr(this._canvas);
		
		var button: HTMLElement = document.createElement("button");
		document.body.appendChild(button);
		button.textContent = "Load Scene";
		button.addEventListener("click", () => {
			Engine.scene = new TestScene();
			Engine.run();
		});
	}

	//--------------------------------------------------------------------------------
	// Static methods
	//--------------------------------------------------------------------------------

	static get canvas(): HTMLCanvasElement {
		return Engine._instance.canvas;
	}

	static get delta_time(): number {
		return Engine._instance.delta_time;
	}
	
	static get rendering_mgr(): RenderingMgr {
		return Engine._instance.rendering_mgr;
	}

	static get scene(): Scene {
		return Engine._instance.scene;
	}

	static set scene(scene: Scene) {
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

	private get canvas(): HTMLCanvasElement {
		return this._canvas;
	}

	private get delta_time(): number {
		return this._delta_time_ms;
	}

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
		this.reset_timer();
		window.requestAnimationFrame(Engine._instance.update.bind(Engine._instance));
	}

	private stop(): void {
		Engine._instance._running = false;
	}

	private update(): void {
		this.update_timer();

		if (this._scene)
			this._scene.update();

		this.render();

		if (this._running)
			window.requestAnimationFrame(this.update.bind(this));
	}

	private reset_timer(): void {
		this._prev_time = performance.now();
	}

	private update_timer(): void {
		const curr_time: DOMHighResTimeStamp = performance.now();
		this._delta_time_ms = curr_time - this._prev_time;
		this._prev_time = curr_time;
	}

	private render(): void {
		if (this._scene)
			this._rendering_mgr.render(this._scene);
	}
}