import { BodyType } from 'matter';
import { Ray } from './ray';
import { Vec2 } from '../vec2';

export function getEdgesOfBody(body: BodyType): Ray[] {
  const edges = [];
  for (const part of body.parts) {
    const vertices = part.vertices;
    for (let i = 0; i < vertices.length; i++) {
      const nextVertex = (i + 1) % vertices.length;
      const edgeRay = new Ray(
        Vec2.from(vertices[i]),
        Vec2.from(vertices[nextVertex]));
      edgeRay.vertices = [vertices[i], vertices[nextVertex]];
      edges.push(edgeRay);
    }
  }
  return edges;
}
