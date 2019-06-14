import { VertexPositionColor } from "./vertex";
import { VertexShader, FragmentShader, Program } from "./shader";
import { Scene } from "./scene";
import { ForwardPass } from "./pass/forward_pass";

import { Entity } from "../ecs";
import { Transform } from "../components/transform";
import { Camera, OrthographicCamera, PerspectiveCamera } from "../components/camera";
import { Model } from "../components/model";

import { mat4 } from "gl-matrix";


export class Renderer {
	private _context: WebGL2RenderingContext;
	private _forward_pass: ForwardPass;

	constructor(context: WebGL2RenderingContext) {
		this._context = context;
		this._forward_pass = new ForwardPass(context);
	}

	render(scene: Scene): void {
		scene.ecs.forEach([PerspectiveCamera, Transform], (entity: Entity) => {
			var cam: PerspectiveCamera = entity.getComponent(PerspectiveCamera);
			var transform: Transform = entity.getComponent(Transform);
			this.renderCamera(scene, cam, transform);
		});

		scene.ecs.forEach([OrthographicCamera, Transform], (entity: Entity) => {
			var cam: OrthographicCamera = entity.getComponent(OrthographicCamera);
			var transform: Transform = entity.getComponent(Transform);
			this.renderCamera(scene, cam, transform);
		});
	}

	renderCamera(scene: Scene, cam: Camera, transform: Transform): void {
		// const world_to_camera: mat4 = transform.world_to_object_matrix;
		// const camera_to_projection: mat4 = cam.camera_to_projection_matrix;
		// var world_to_projection: mat4 = mat4.create();
		// mat4.multiply(world_to_projection, camera_to_projection, world_to_camera);

		this._forward_pass.render(scene, cam, transform);
	}
}