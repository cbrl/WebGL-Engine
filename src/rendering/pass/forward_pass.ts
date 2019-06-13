import { VertexShader, FragmentShader, Program } from "../shader";
import { forward_vs } from "../../shaders/forward_vs";
import { forward_fs } from "../../shaders/forward_fs";

import { VertexPositionColor } from "../vertex";
import { Scene } from "../scene";

import { Entity } from "../../ecs";
import { Model } from "../../components/model";
import { Transform } from "../../components/transform";

import { mat4 } from "gl-matrix";
 
export class ForwardPass {
	private _context: WebGLRenderingContext;
	private _program: Program;

	constructor(context: WebGLRenderingContext) {
		this._context = context;

		var vertex_shader = new VertexShader(this._context, forward_vs);
		var fragment_shader = new FragmentShader(this._context, forward_fs);

		this._program = new Program(this._context, vertex_shader, fragment_shader, VertexPositionColor.vertex_descs);
	}

	render(scene: Scene, world_to_camera: mat4, camera_to_projection: mat4): void {
		
		// Must bind program before binding attributes
		this._program.bindProgram(this._context);

		const view_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_view");
		const proj_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_proj");
		this._context.uniformMatrix4fv(view_loc, false, world_to_camera);
		this._context.uniformMatrix4fv(proj_loc, false, camera_to_projection);

		scene.ecs.forEach([Model, Transform], (entity: Entity) => {
			var model: Model = entity.getComponent(Model);
			var model_transform: Transform = entity.getComponent(Transform);

			model.bindVertexBuffer(this._context); //Bind the shape's vertex buffer
			this._program.bindVertexDescs(this._context); //After binding the vertex buffer, bind the vertex attributes
			
			const object_to_world: mat4 = model_transform.object_to_world_matrix;

			const world_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_world");
			//const view_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_view");
			//const proj_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_proj");

			this._context.uniformMatrix4fv(world_loc, false, object_to_world);
			//this._context.uniformMatrix4fv(view_loc, false, world_to_camera);
			//this._context.uniformMatrix4fv(proj_loc, false, camera_to_projection);

			model.render(this._context);
		});
	}
}