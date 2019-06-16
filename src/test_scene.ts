import { Engine } from "./engine";
import { Scene } from "./rendering/scene";
import { VertexPositionNormalColor, VertexPositionColor } from "./rendering/vertex";
import { vec3 } from "gl-matrix";
import { calculateNormals } from "./math";

import { ECS, Entity, Component, System } from "./ecs";
import { Transform } from "./components/transform";
import { PerspectiveCamera, OrthographicCamera } from "./components/camera";
import { Model } from "./components/model";
import { DirectionalLight, PointLight, SpotLight, AmbientLight } from "./components/lights";


export class TestScene extends Scene {

	constructor() {
		super();
	}

	initialize(): void {
		var context: WebGL2RenderingContext = Engine.rendering_mgr.context;

		var cam = this.ecs.createEntity();
		var transform = cam.addComponent(new Transform());
		var camera = cam.addComponent(new PerspectiveCamera());
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

		var tri0 = this.ecs.createEntity();
		tri0.addComponent(new Transform);
		tri0.addComponent(new Model(context, vertices_pos_norm_color));

		var tri1 = this.ecs.createEntity();
		tri1.addComponent(new Transform()).translateX(-1);
		tri1.addComponent(new Model(context, vertices_pos_norm_color));

		var tri2 = this.ecs.createEntity();
		tri2.addComponent(new Transform()).translateX(1);
		tri2.addComponent(new Model(context, vertices_pos_color));

		var light = this.ecs.createEntity();
		light.addComponent(new Transform).translateZ(0.1);
		// var spot_light = light.addComponent(new SpotLight);
		// spot_light.base_color = [1, 1, 1];
		// spot_light.intensity = 10;
		// spot_light.range = 100;
		// spot_light.attenuation = [0, 0, 1];
		// spot_light.cos_penumbra = 0.05;
		// spot_light.cos_umbra = 0.06;

		// var point_light = light.addComponent(new PointLight);
		// point_light.base_color = [1, 1, 1];
		// point_light.intensity = 10;
		// point_light.range = 100;
		// point_light.attenuation = [0, 0, 0.8];
		
		var dir_light = light.addComponent(new DirectionalLight);
		dir_light.base_color = [1, 1, 1];
		dir_light.intensity = 3;
		dir_light.proj_size = [2.5, 2];
		dir_light.range = 100;

		
		var ambient_light = this.ecs.createEntity();
		var ambient = ambient_light.addComponent(new AmbientLight);
		ambient.base_color = [1, 1, 1];
		ambient.intensity = 0.5;
	}

	uninitialize(): void {
		
	}

	updateScene(): void {
		
	}
}