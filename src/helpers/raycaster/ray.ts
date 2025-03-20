import { BodyType, Vector } from 'matter';
import { Vec2 } from '../vec2';
import { isNearlyEqual } from '../math';
import { RayToBodyCollision } from './types';
import { getEdgesOfBody } from './getEdgesOfBody';

export class Ray {
  start: Vec2;
  end: Vec2;
  vertices: Vector[]; // TODO: Does this belong here?
  constructor(start: Vec2, end: Vec2) {
    this.start = start;
    this.end = end;
  }

  yValueAtX(x: number) {
    return this.yOffsetWhereXIsZero + this.slope * x;
  }

  xValueAtY(y: number) {
    return (y - this.yOffsetWhereXIsZero) / this.slope;
  }

  // Check if point is within this ray's bounding box (inclusive)
  pointIsInBounds(point: Vec2): boolean {
    const minX = Math.min(this.start.x, this.end.x);
    const maxX = Math.max(this.start.x, this.end.x);
    const minY = Math.min(this.start.y, this.end.y);
    const maxY = Math.max(this.start.y, this.end.y);
    return (point.x >= minX && point.x <= maxX
         && point.y >= minY && point.y <= maxY);
  }

  calculateNormal(referencePoint: Vec2): Vec2 {
    const difference = this.difference;

    // Get the two possible normals as points that lie perpendicular to the ray
    const norm1 = difference.normalize().rotate(Math.PI / 2);
    const norm2 = difference.normalize().rotate(Math.PI / -2);

    // Return the normal that is closest to the reference point
    if (this.start.plus(norm1).distanceFrom(referencePoint) < this.start.plus(norm2).distanceFrom(referencePoint))
      return norm1;
    else
      return norm2;
  }

  get difference() {
    return this.end.minus(this.start);
  }

  get slope() {
    const difference = this.difference;
    return difference.y / difference.x;
  }

  get yOffsetWhereXIsZero() { return this.start.y - this.slope * this.start.x; }
  get isHorizontal() { return isNearlyEqual(this.start.y, this.end.y); }
  get isVertical() { return isNearlyEqual(this.start.x, this.end.x); }

  getIntersectionWith(rayB: Ray): Vec2 | null {
    // Axis-aligned rays
    if (this.isVertical && rayB.isVertical) return null;
    if (this.isVertical) return new Vec2(this.start.x, rayB.yValueAtX(this.start.x));
    if (rayB.isVertical) return new Vec2(rayB.start.x, this.yValueAtX(rayB.start.x));
    if (isNearlyEqual(this.slope, rayB.slope)) return null;
    if (this.isHorizontal) return new Vec2(rayB.xValueAtY(this.start.y), this.start.y);
    if (rayB.isHorizontal) return new Vec2(this.xValueAtY(rayB.start.y), rayB.start.y);

    const x = (rayB.yOffsetWhereXIsZero - this.yOffsetWhereXIsZero) / (this.slope - rayB.slope);
    return new Vec2(x, this.yValueAtX(x));
  }

  getCollisionPointWith(rayB: Ray): Vec2 | null {
    const intersection = this.getIntersectionWith(rayB);
    if (!intersection) return null;
    if (!this.pointIsInBounds(intersection)) return null;
    if (!rayB.pointIsInBounds(intersection)) return null;
    return intersection;
  }

  getRayCollisionsWithBody(body: BodyType): RayToBodyCollision[] {
    const edges = getEdgesOfBody(body);

    // Iterate through each edge and test for collision with 'rayA'
    const collisions = [];
    for (let i = edges.length - 1; i >= 0; i--) {
      const collisionPoint = this.getCollisionPointWith(edges[i]);
      if (!collisionPoint) continue;
      const normalOfEdge = edges[i].calculateNormal(this.start);
      collisions.push({
        body: body,
        point: collisionPoint,
        normal: normalOfEdge,
        verts: edges[i].vertices
      });
    }

    return collisions;
  }
}
