import { Engine } from "./engine";
import { Scene } from "./rendering/scene";
import { ECS, Entity, Component, System } from "./ecs";
import { Transform } from "./components/transform";
import { PerspectiveCamera, OrthographicCamera } from "./components/camera";
import { VertexPositionColor } from "./rendering/vertex";
import { Model } from "./components/model";
import { vec3 } from "gl-matrix";

export class TestScene extends Scene {

	constructor() {
		super();
	}

	initialize(): void {
		var context: WebGL2RenderingContext = Engine.rendering_mgr.context;

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

	uninitialize(): void {
		
	}

	updateScene(): void {
		
	}
}