import { ECS } from "../ecs";

export abstract class Scene {
	ecs: ECS = new ECS();

	constructor() {}

	// Called when a scene is being loaded by the engine
	abstract load(): void;

	// Called when the engine's current scene (this one) is being replaced
	abstract unload(): void;

	// Called every tick
	update(): void {
		this.ecs.update();
		this.updateScene();
	}

	abstract updateScene(): void;
}