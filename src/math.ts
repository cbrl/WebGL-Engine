import { vec3 } from "gl-matrix";
import { Vertex, VertexPositionNormalColor } from "./rendering/vertex";

export function randomRange(min: number, max: number): number {
	return (Math.random() * (max - min)) + min;
}

// Returns a random integer in the range [min, max)
export function randomInt(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}


export function minMaxPoint(vertices: Vertex[]): [vec3, vec3] {
	var min: vec3 = vec3.fromValues(Infinity, Infinity, Infinity);
	var max: vec3 = vec3.fromValues(-Infinity, -Infinity, -Infinity);

	for (let vertex of vertices) {
		for (let i: number = 0; i < 3; ++i) {
			min[i] = Math.min(min[i], vertex[i]);
			max[i] = Math.max(max[i], vertex[i]);
		}
	}

	return [min, max];
}

export function calculateNormals(vertices: VertexPositionNormalColor[]): void {
	for (let vertex of vertices) {
		vec3.copy(vertex.normal, [0, 0, 0]);
	}

	for (let i = 0; i <= (vertices.length - 3);) {
		let v0 = vertices[i];
		let v1 = vertices[i+1];
		let v2 = vertices[i+2];

		let v10: vec3 = vec3.create();
		let v20: vec3 = vec3.create();

		vec3.subtract(v10, v1.position, v0.position);
		vec3.subtract(v20, v2.position, v0.position);

		let normal: vec3 = vec3.create();
		vec3.cross(normal, v10, v20);
		
		vec3.add(v0.normal, v0.normal, normal);	
		vec3.add(v1.normal, v1.normal, normal);
		vec3.add(v2.normal, v2.normal, normal);

		i += 3;
	}

	for (let vertex of vertices) {
		vec3.normalize(vertex.normal, vertex.normal);
	}
}