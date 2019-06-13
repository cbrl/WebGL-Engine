export const forward_fs = String.raw`
//Fragment shaders do not have precision so we have to set it.
precision mediump float;
varying vec3 v_color;
void main() {
	gl_FragColor = vec4(v_color, 1);
}
`;