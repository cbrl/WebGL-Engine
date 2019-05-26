import { Engine } from "./engine";
import { Shape } from "./shape";
import { PerspectiveCamera, OrthographicCamera } from "./camera";
import { VertexPositionColor } from "./vertex";
import { vec3 } from "./gl-matrix";

export class Scene {
	shapes: Shape[] = [];
	camera: PerspectiveCamera = new PerspectiveCamera();

	constructor() {}

	load(): void {
		var context = Engine.rendering_mgr.context;
		
		this.camera.transform.translation = vec3.fromValues(0, 0, 3);

		var vertices = [
			new VertexPositionColor([ 0,    1,   0], [1, 0, 0]),
			new VertexPositionColor([-0.5,  0,   0], [0, 1, 0]),
			new VertexPositionColor([ 0.5 , 0,   0], [0, 0, 1]),
			new VertexPositionColor([ 0,   -1,   0], [0, 1, 1]),
			new VertexPositionColor([ 0.5,  0,   0], [1, 1, 0]),
			new VertexPositionColor([-0.5,  0,   0], [1, 0, 1]),
		];
		
		this.shapes.push(new Shape(context, vertices));
	}
}