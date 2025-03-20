import { randomInRange, randomItem } from '../helpers/math';
import { HealthBar } from './health-bar';
import { Player } from './player';

export class Manna extends Phaser.Physics.Matter.Sprite {
  worth = 8;

  constructor(scene: Phaser.Scene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene.matter.world, object.x, object.y, 'manna');

    this.setSensor(true);
    this.setStatic(true);
    this.setIgnoreGravity(true);
    this.setScale(1.5);

    this.anims.create({
      key: 'rotate',
      frames: this.anims.generateFrameNumbers('manna', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.play('rotate');

    const hoverIntensity = 4;
    const hoverTween = scene.tweens.add({
      targets: this,
      y: this.y - hoverIntensity,
      duration: randomInRange(950, 1300),
      delay: randomInRange(0, 500),
      ease: 'Sine.easeInOut',
      yoyo: true,
      loop: -1
    });
    this.on('destroy', () => {
      hoverTween.destroy();
    });

    scene.add.existing(this);
  }

  collect(player: Player, healthBar: HealthBar) {
    const tunings = [-500, -100, 0, 200, 400, 700, 1100];
    this.scene.sound.play('manna', { detune: randomItem(tunings), volume: 0.4, delay: randomInRange(0, 50) / 1000 });
    player.health += this.worth;
    healthBar.setLevel(player.health);
    this.destroy();
  }
}
