import { Engine } from "./engine";
import { Shape } from "./shape";
import { Camera, PerspectiveCamera, OrthographicCamera } from "./camera";
import { VertexPositionColor } from "./vertex";
import { vec3 } from "./gl-matrix";

export abstract class Scene {
	shapes: Shape[] = [];
	camera: Camera;
	abstract load(): void;
	abstract update(): void;
}

export class TestScene extends Scene {

	constructor() {
		super();
		this.camera = new PerspectiveCamera();
	}

	load(): void {
		var context: WebGLRenderingContext = Engine.rendering_mgr.context;
		
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

	update(): void {

	}
}