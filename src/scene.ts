import { Engine } from "./engine";
import { Shape } from "./shape";
import { Camera, PerspectiveCamera, OrthographicCamera } from "./camera";
import { VertexPositionColor } from "./vertex";
import { vec3 } from "./gl-matrix";

export abstract class Scene {
	shapes: Shape[] = [];
	camera: Camera;

	// Called when a scene is being loaded by the engine
	abstract load(): void;

	// Called when the engine's current scene (this one) is being replaced
	abstract unload(): void;

	// Called every tick
	abstract update(): void;
}

export class TestScene extends Scene {

	constructor() {
		super();
	}

	load(): void {
		var context: WebGLRenderingContext = Engine.rendering_mgr.context;
		
		this.camera = new PerspectiveCamera();
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

	unload(): void {
		
	}

	update(): void {

	}
}