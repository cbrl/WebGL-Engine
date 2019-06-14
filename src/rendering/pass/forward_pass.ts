import { ForwardProgram } from "../programs/forward_program";

import { Scene } from "../scene";

import { Entity } from "../../ecs";
import { Transform } from "../../components/transform";
import { Camera } from "../../components/camera";
import { Model } from "../../components/model";

import { mat4 } from "gl-matrix";
import { ModelBuffer, CameraBuffer } from "../buffer/buffers";
 
export class ForwardPass {
	private _context: WebGL2RenderingContext;
	private _program: ForwardProgram;

	constructor(context: WebGL2RenderingContext) {
		this._context = context;
		this._program = new ForwardProgram(this._context);
	}

	render(scene: Scene, camera: Camera, camera_transform: Transform): void {
		// Must bind program before binding attributes
		this._program.bindProgram(this._context);
		
		// Update camera uniform buffer
		this.uploadCameraData(camera, camera_transform);

		scene.ecs.forEach([Model, Transform], (entity: Entity) => {
			var model: Model = entity.getComponent(Model);
			var model_transform: Transform = entity.getComponent(Transform);

			//Bind the shape's vertex buffer
			model.bindBuffer(this._context); 

			// Update the model uniform buffer
			this.uploadModelData(model_transform);

			// Render the model
			model.render(this._context);
		});
	}

	private uploadCameraData(camera: Camera, transform: Transform): void {
		var buffer: CameraBuffer = new CameraBuffer;
		buffer.world_to_camera = transform.world_to_object_matrix;
		buffer.camera_to_projection = camera.camera_to_projection_matrix;
		this._program.updateUniform(this._context, "Camera", buffer.data);
	}

	private uploadModelData(transform: Transform): void {
		var buffer: ModelBuffer = new ModelBuffer;
		buffer.world = transform.object_to_world_matrix;
		buffer.tex_transform = mat4.create();
		mat4.invert(buffer.world_inv_transpose, buffer.world);
		mat4.transpose(buffer.world_inv_transpose, buffer.world_inv_transpose);
		this._program.updateUniform(this._context, "Model", buffer.data);
	}
}
