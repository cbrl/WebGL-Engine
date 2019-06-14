export class UniformBuffer {
	private readonly _buffer: WebGLBuffer;
	private readonly _size: number = 0;

	constructor(context: WebGL2RenderingContext, size: number, slot: number) {
		this._size = size;
		this._buffer = context.createBuffer();
		if (this._buffer) {
			context.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this._buffer);
			context.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, size, WebGL2RenderingContext.STATIC_DRAW);
			this.bindBase(context, slot);
		}
		else {
			console.error("Uniform buffer creation failed (size: ", size, "). Error code: ", context.getError());
		}
	}

	destroyBuffer(context: WebGL2RenderingContext): void {
		if (this._buffer) {
			context.deleteBuffer(this._buffer);
		}
	}

	updateData<T extends ArrayBufferView>(context: WebGL2RenderingContext, data: T): void {
		if (!this._buffer) {
			console.warn("Attempting to update data of uninitialized buffer");
			return;
		}
		if (data.byteLength != this._size) {
			console.warn("Updating a uniform buffer of size ", this._size, " with data of size ", data.byteLength);
		}
		context.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this._buffer);
		context.bufferSubData(WebGL2RenderingContext.UNIFORM_BUFFER, 0, data, 0);
	}

	bindBase(context: WebGL2RenderingContext, slot: number): void {
		context.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, slot, this._buffer);
	}
}