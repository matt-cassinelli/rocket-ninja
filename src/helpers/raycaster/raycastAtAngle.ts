import { findEndPoint } from '../math';
import { raycast } from './raycast';
import { RaycastAtAngleRequest, RaycastResult } from './types';

export function raycastAtAngle(req: RaycastAtAngleRequest): RaycastResult {
  const reasonableGuessForLongestPossibleLine = req.scene.game.canvas.width * 1.5;
  const endPt = findEndPoint(req.start, req.angle, reasonableGuessForLongestPossibleLine);
  return raycast({
    scene: req.scene,
    start: req.start,
    end: endPt,
    labelToIgnore: req.labelToIgnore
  });
}
