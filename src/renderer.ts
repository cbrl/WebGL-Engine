import { VertexPositionColor } from "./vertex";
import { VertexShader, FragmentShader, Program } from "./shader";
import { Scene } from "./scene";
import { Transform } from "./transform";
import { OrthographicCamera, PerspectiveCamera } from "./camera";
import { Model } from "./model";
import { ECS, Entity, Component } from "./ecs";
import { mat4 } from "gl-matrix";

const g_vertex_shader_source = String.raw`
attribute vec3 a_position;
attribute vec3 a_color;
varying vec3 v_color;

uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_proj;

void main() {
	gl_Position = u_proj * u_view * u_world * vec4(a_position, 1);
	v_color = a_color;
}
`;

const g_fragment_shader_source = String.raw`
//Fragment shaders do not have precision so we have to set it.
precision mediump float;
varying vec3 v_color;
void main() {
	gl_FragColor = vec4(v_color, 1);
}
`;

export class Renderer {
	private _context: WebGLRenderingContext;
	private _program: Program;

	constructor(context: WebGLRenderingContext) {
		this._context = context;

		var vertex_shader = new VertexShader(this._context, g_vertex_shader_source);
		var fragment_shader = new FragmentShader(this._context, g_fragment_shader_source);

		this._program = new Program(this._context, vertex_shader, fragment_shader, VertexPositionColor.vertex_descs);
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

	renderCamera(scene: Scene, cam: PerspectiveCamera | OrthographicCamera, transform: Transform): void {
		const world_to_camera: mat4 = transform.world_to_object_matrix;
		const camera_to_projection: mat4 = cam.camera_to_projection_matrix;

		// Must bind program before binding attributes
		this._program.bindProgram(this._context);
		
		scene.ecs.forEach([Model, Transform], (entity: Entity) => {
			var model: Model = entity.getComponent(Model);
			var model_transform: Transform = entity.getComponent(Transform);

			model.bindVertexBuffer(this._context); //Bind the shape's vertex buffer
			this._program.bindVertexDescs(this._context); //After binding the vertex buffer, bind the vertex attributes
			
			const object_to_world: mat4 = model_transform.object_to_world_matrix;

			const world_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_world");
			const view_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_view");
			const proj_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.gl_program, "u_proj");

			this._context.uniformMatrix4fv(world_loc, false, object_to_world);
			this._context.uniformMatrix4fv(view_loc, false, world_to_camera);
			this._context.uniformMatrix4fv(proj_loc, false, camera_to_projection);

			model.render(this._context);
		});
	}
}