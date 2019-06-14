import { Program, VertexShader, FragmentShader } from "../shader";
import { VertexPositionNormalColor } from "../vertex";
import { CameraBuffer, ModelBuffer, UniformBufferLocations } from "../buffer/buffers";

import { forward_vs } from "../shaders/forward_vs";
import { forward_fs } from "../shaders/forward_fs";

export class ForwardProgram extends Program {
	constructor(context: WebGL2RenderingContext) {
		super(context, new VertexShader(context, forward_vs), new FragmentShader(context, forward_fs));
		this.addUniform(context, "Camera", CameraBuffer.size, UniformBufferLocations.CAMERA);
		this.addUniform(context, "Model", ModelBuffer.size, UniformBufferLocations.MODEL);
		//this.addUniform(context, "Lights", LightBuffer.size, UniformBufferLocations.LIGHT);
	}
}