import { ECS } from "../ecs";

export abstract class Scene {
	ecs: ECS = new ECS();

	constructor() {}

	// Called when a scene is being loaded by the engine
	load(): void {
		// Add stuff required for the engine to operate correctly
		this.initialize();
	}

	unload(): void {
		this.uninitialize();
		// Remove stuff added in Scene.load()
	}

	// Overloaded by custom scenes and called during Scene.load()
	abstract initialize(): void;

	// Called when the engine's current scene (this one) is being destroyed
	abstract uninitialize(): void;

	// Called every tick
	update(): void {
		this.ecs.update();
		this.updateScene();
	}

	abstract updateScene(): void;
}