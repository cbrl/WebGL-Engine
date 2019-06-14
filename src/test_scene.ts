import { Engine } from "./engine";
import { Scene } from "./rendering/scene";
import { VertexPositionNormalColor, VertexPositionColor } from "./rendering/vertex";
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

		const vertices_pos_norm_color: VertexPositionNormalColor[] = [
			new VertexPositionNormalColor([ 0,    1,   0], vec3.create(), [1, 0, 0]),
			new VertexPositionNormalColor([-0.5,  0,   0], vec3.create(), [0, 1, 0]),
			new VertexPositionNormalColor([ 0.5 , 0,   0], vec3.create(), [0, 0, 1]),
			new VertexPositionNormalColor([ 0,   -1,   0], vec3.create(), [0, 1, 1]),
			new VertexPositionNormalColor([ 0.5,  0,   0], vec3.create(), [1, 1, 0]),
			new VertexPositionNormalColor([-0.5,  0,   0], vec3.create(), [1, 0, 1]),
		];
		calculateNormals(vertices_pos_norm_color);

		const vertices_pos_color: VertexPositionColor[] = [
			new VertexPositionColor([ 0,    1,   0], [1, 1, 0]),
			new VertexPositionColor([-0.5,  0,   0], [1, 1, 0]),
			new VertexPositionColor([ 0.5 , 0,   0], [1, 1, 0]),
			new VertexPositionColor([ 0,   -1,   0], [0, 1, 1]),
			new VertexPositionColor([ 0.5,  0,   0], [0, 1, 1]),
			new VertexPositionColor([-0.5,  0,   0], [0, 1, 1]),
		];

		var tri1 = this.ecs.createEntity();
		tri1.addComponent(new Transform()).translateX(-1);
		tri1.addComponent(new Model(context, vertices_pos_norm_color));

		var tri2 = this.ecs.createEntity();
		tri2.addComponent(new Transform()).translateX(1);
		tri2.addComponent(new Model(context, vertices_pos_color));
	}

	uninitialize(): void {
		
	}

	updateScene(): void {
		
	}
}