import { Program, VertexShader, FragmentShader } from "../shader";
import { VertexPositionColor } from "../vertex";
import { CameraBuffer, ModelBuffer } from "../buffer/buffers";

import { forward_vs } from "../shaders/forward_vs";
import { forward_fs } from "../shaders/forward_fs";

export class ForwardProgram extends Program {
	constructor(context: WebGL2RenderingContext) {
		super(context, new VertexShader(context, forward_vs), new FragmentShader(context, forward_fs), VertexPositionColor.vertex_descs);
		this.addUniform(context, "Camera", CameraBuffer.size, 1);
		this.addUniform(context, "Model", ModelBuffer.size, 2);
	}
}