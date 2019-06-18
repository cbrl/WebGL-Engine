import { RenderingMgr } from "./rendering/rendering_mgr";
import { Scene } from "./rendering/scene";
import { TestScene } from "./scenes/test_scene";

export class Engine {
	private static _instance: Engine = new Engine();

	private _running: boolean = false;
	private _prev_time: DOMHighResTimeStamp;
	private _delta_time_ms: number = 0;

	private _canvas: HTMLCanvasElement;
	private _rendering_mgr: RenderingMgr;
	private _input: Map<string, boolean> = new Map();

	private _scene: Scene;

	constructor() {
		var button_section: HTMLElement = document.createElement("section");
		document.body.appendChild(button_section);
		button_section.setAttribute("style", "padding-bottom: 8px");

		var canvas_section: HTMLElement = document.createElement("section");
		document.body.appendChild(canvas_section);

		// Create and append the "Load Scene" button
		var button: HTMLElement = document.createElement("button");
		button_section.appendChild(button);
		button.textContent = "Load Scene";
		button.addEventListener("click", () => {
			Engine.scene = new TestScene();
			Engine.run();
		});

		// Create and append the canvas
		this._canvas = <HTMLCanvasElement>document.createElement("canvas");
		canvas_section.appendChild(this._canvas);
		this._canvas.setAttribute("width", "640");
		this._canvas.setAttribute("height", "480");
		this._canvas.setAttribute("tabindex", "1"); //set tabindex so canvas can be focused

		// Create rendering manager
		this._rendering_mgr = new RenderingMgr(this._canvas);

		// Add input event listeners
		this.canvas.addEventListener('keydown', (event) => {
			this._input.set(event.key, true);
		});
		this.canvas.addEventListener('keyup', (event) => {
			this._input.set(event.key, false);
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

	static get input(): Map<string, boolean> {
		return Engine._instance.input;
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

	private get input(): Map<string, boolean> {
		return this._input;
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
		this._canvas.focus();
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