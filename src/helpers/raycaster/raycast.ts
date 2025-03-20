// Improve Matter.js' raycaster to return accurate collision points.

import { Vec2 } from '../vec2';
import { RaycastRequest, RaycastResult, RayToBodyCollision } from './types';
import { Ray } from './ray';

export function raycast(req: RaycastRequest): RaycastResult {
  const bodies = req.scene.matter.world.getAllBodies()
    .filter(b => !b.isSensor);

  const query = req.scene.matter.query.ray(bodies, req.start, req.end);
  const start = Vec2.from(req.start);
  const end = Vec2.from(req.end);
  const ray = new Ray(start, end);

  // Iterate through each body to see where the ray intersects with it.
  let collisions: RayToBodyCollision[] = [];
  for (let i = query.length - 1; i >= 0; i--) {
    const bcols = ray.getRayCollisionsWithBody(query[i].body);
    for (let k = bcols.length - 1; k >= 0; k--) {
      collisions.push(bcols[k]);
    }
  }

  if (req.labelToIgnore)
    collisions = collisions.filter(b => b.body.label != req.labelToIgnore);

  collisions.sort(function(a, b) {
    const distanceFromRayStart = a.point.distanceFrom(start) - b.point.distanceFrom(start);
    return distanceFromRayStart;
  });

  const madeContact = req.labelToTest
    ? collisions[0].body.label == req.labelToTest
    : collisions.length != 0;

  return {
    madeContact: madeContact,
    point: collisions[0].point,
    object: collisions[0].body
  };
}
