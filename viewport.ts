export class Viewport {
	top_left: [number, number];
	size: [number, number];
	
	constructor(top_left: [number, number] = [0, 0], size: [number, number] = [640, 480]) {
		this.top_left = top_left;
		this.size = size;
	}

	get width(): number {
		return this.size[0];
	}

	set width(value: number) {
		this.size[0] = value;
	}

	get height(): number {
		return this.size[1];
	}

	set height(value: number) {
		this.size[1] = value;
	}

	get aspect_ratio(): number {
		return this.width / this.height;
	}

	bind(context: WebGLRenderingContext): void {
		context.viewport(this.top_left[0], this.top_left[1], this.size[0], this.size[1]);
	}
}