import { randomInRange } from '../helpers/math';
import { Player } from './player';

function addGib(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.Physics.Matter.Image {
  return scene.matter.add.image(x, y, key, null,
    { chamfer: 15, restitution: 0.75, friction: 0.02, frictionAir: 0.01 })
    .setScale(1.35)
    .setAngularSpeed(randomInRange(-0.5, 0.5, 4));
}

export function explodeGibs(scene: Phaser.Scene, player: Player): void {
  const { x: x, y: y } = player.sprite;
  const h = 45;
  const w = 23;
  player.sprite.destroy();
  addGib(scene, x,         y - h / 2, 'gib-head')
    .setVelocity(randomInRange(-8, 8, 4), randomInRange(-3, -8, 4));
  addGib(scene, x,         y,         'gib-torso');
  addGib(scene, x - w / 3, y,         'gib-arm')
    .setVelocity(randomInRange(-2, 2, 4), randomInRange(0, -2, 4));
  addGib(scene, x + w / 3, y,         'gib-arm')
    .setVelocity(randomInRange(-2, 2, 4), randomInRange(0, -2, 4))
    .setFlipX(true);
  addGib(scene, x - w / 4, y + h / 3, 'gib-leg')
    .setVelocity(randomInRange(1, 5, 4),  randomInRange(0, -5, 4))
    .setFlipX(true);
  addGib(scene, x + w / 4, y + h / 3, 'gib-leg')
    .setVelocity(randomInRange(-5, 1, 4), randomInRange(0, -5, 4));
}
