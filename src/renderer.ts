import { VertexPositionColor } from "./vertex";
import { VertexShader, FragmentShader, Program } from "./shader";
import { Scene } from "./scene";

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
	_context: WebGLRenderingContext;
	_program: Program;

	constructor(context: WebGLRenderingContext) {
		this._context = context;

		var vertex_shader = new VertexShader(this._context, g_vertex_shader_source);
		var fragment_shader = new FragmentShader(this._context, g_fragment_shader_source);

		this._program = new Program(this._context, vertex_shader, fragment_shader, VertexPositionColor.vertex_descs);
	}

	render(scene: Scene): void {
		// Must bind program before setting attributes
		this._program.bind(this._context);
		
		const world_to_camera: number[] = scene.camera.transform.world_to_object_matrix;
		const camera_to_projection: number[] = scene.camera.camera_to_projection_matrix;

		const view_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.getProgram(), "u_view");
		const proj_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.getProgram(), "u_proj");

		this._context.uniformMatrix4fv(view_loc, false, world_to_camera);
		this._context.uniformMatrix4fv(proj_loc, false, camera_to_projection);

		for (const shape of scene.shapes) {
			const object_to_world: number[] = shape.transform.object_to_world_matrix;
			
			const world_loc: WebGLUniformLocation = this._context.getUniformLocation(this._program.getProgram(), "u_world");
			this._context.uniformMatrix4fv(world_loc, false, object_to_world);

			shape.render(this._context);
		}
	}
}