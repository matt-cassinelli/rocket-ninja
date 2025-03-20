export class Vec2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static from(vectorLike: any) {
    return new Vec2(vectorLike.x, vectorLike.y);
  }

  static fromAngle(angle: number, magnitude = 1) {
    return new Vec2(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude);
  }

  get inverted() {
    return this.multiply(-1);
  }

  get directionRadians() {
    return Math.atan2(this.y, this.x);
  }

  normalize(magnitude = 1) {
    return this.multiply(magnitude / this.distanceFrom());
  }

  multiply(factor: number) {
    return new Vec2(this.x * factor, this.y * factor);
  }

  plus(other: Vec2) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  minus(other: Vec2) {
    return this.plus(other.inverted);
  }

  rotate(rotation: number) {
    let angle = this.directionRadians;
    const magnitude = this.distanceFrom();
    angle += rotation;
    return Vec2.fromAngle(angle, magnitude);
  }

  distanceFrom(other = new Vec2()) {
    return Math.sqrt(
        Math.pow(this.x - other.x, 2)
      + Math.pow(this.y - other.y, 2));
  }
}
