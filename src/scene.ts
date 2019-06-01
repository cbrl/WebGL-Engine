import { Engine } from "./engine";
import { ECS, Entity, Component, System } from "./ecs";
import { Transform } from "./transform";
import { PerspectiveCamera, OrthographicCamera } from "./camera";
import { VertexPositionColor } from "./vertex";
import { Model } from "./model";
import { vec3 } from "./gl-matrix";

export abstract class Scene {
	ecs: ECS = new ECS();

	constructor() {}

	// Called when a scene is being loaded by the engine
	abstract load(): void;

	// Called when the engine's current scene (this one) is being replaced
	abstract unload(): void;

	// Called every tick
	abstract update(): void;
}


export class TestScene extends Scene {

	constructor() {
		super();
	}

	load(): void {
		var context: WebGLRenderingContext = Engine.rendering_mgr.context;

		var cam: Entity = this.ecs.createEntity();
		cam.addComponent(new Transform()).translation = vec3.fromValues(0, 0, 3);
		cam.addComponent(new PerspectiveCamera());

		const vertices: VertexPositionColor[] = [
			new VertexPositionColor([ 0,    1,   0], [1, 0, 0]),
			new VertexPositionColor([-0.5,  0,   0], [0, 1, 0]),
			new VertexPositionColor([ 0.5 , 0,   0], [0, 0, 1]),
			new VertexPositionColor([ 0,   -1,   0], [0, 1, 1]),
			new VertexPositionColor([ 0.5,  0,   0], [1, 1, 0]),
			new VertexPositionColor([-0.5,  0,   0], [1, 0, 1]),
		];

		var tris = this.ecs.createEntity();
		tris.addComponent(new Transform());
		tris.addComponent(new Model(context, vertices));
	}

	unload(): void {
		
	}

	update(): void {

	}
}