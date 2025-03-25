import { BodyType, Vector } from 'matter';
import { Vec2 } from '../vec2';

export interface RayToBodyCollision {
  body: BodyType;
  point: Vec2;
  normal: Vec2; // of the edge that the ray collided with
  vertices: Vector[]; // of the edge that the ray collided with
}

export interface RaycastRequest {
  scene: Phaser.Scene;
  start: Vector;
  end: Vector;
  labelToTest?: string;
  labelToIgnore?: string;
}

export interface RaycastAtAngleRequest {
  scene: Phaser.Scene;
  start: Vector;
  angle: number;
  labelToIgnore?: string;
}

export interface RaycastResult {
  madeContact: boolean;
  point: Vector | null;
  object: any | null;
}
