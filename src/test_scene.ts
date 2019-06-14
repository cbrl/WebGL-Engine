import { Engine } from "./engine";
import { Scene } from "./rendering/scene";
import { VertexPositionNormalColor } from "./rendering/vertex";
import { vec3 } from "gl-matrix";
import { calculateNormals } from "./math";

import { ECS, Entity, Component, System } from "./ecs";
import { Transform } from "./components/transform";
import { PerspectiveCamera, OrthographicCamera } from "./components/camera";
import { Model } from "./components/model";


export class TestScene extends Scene {

	constructor() {
		super();
	}

	initialize(): void {
		var context: WebGL2RenderingContext = Engine.rendering_mgr.context;

		var cam: Entity = this.ecs.createEntity();
		var transform: Transform = cam.addComponent(new Transform());
		var camera: PerspectiveCamera = cam.addComponent(new PerspectiveCamera());
		transform.translateZ(3);

		const vertices: VertexPositionNormalColor[] = [
			new VertexPositionNormalColor([ 0,    1,   0], vec3.create(), [1, 0, 0]),
			new VertexPositionNormalColor([-0.5,  0,   0], vec3.create(), [0, 1, 0]),
			new VertexPositionNormalColor([ 0.5 , 0,   0], vec3.create(), [0, 0, 1]),
			new VertexPositionNormalColor([ 0,   -1,   0], vec3.create(), [0, 1, 1]),
			new VertexPositionNormalColor([ 0.5,  0,   0], vec3.create(), [1, 1, 0]),
			new VertexPositionNormalColor([-0.5,  0,   0], vec3.create(), [1, 0, 1]),
		];
		calculateNormals(vertices);

		var tris = this.ecs.createEntity();
		tris.addComponent(new Transform());
		tris.addComponent(new Model(context, vertices));
	}

	uninitialize(): void {
		
	}

	updateScene(): void {
		
	}
}