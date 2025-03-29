import { Vector } from 'matter';
import { GameScene } from '../scenes/game-scene';
import { getAngleRadians } from '../helpers/math';
import { raycast, raycastAtAngle } from '../helpers/raycaster';
import { Player } from './player';

export class LaserTurret extends Phaser.GameObjects.Container {
  private base: Phaser.GameObjects.Image;
  private top: Phaser.GameObjects.Sprite;
  private laser: Phaser.GameObjects.Line;
  private laserEnd: Vector;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private timeline: Phaser.Time.Timeline;
  private status: 'IDLE' | 'TRACKING' | 'CHARGING' | 'FIRING';
  private durations = {
    tracking: 1500,
    charging: 1400,
    firing: 1600
  };

  constructor(scene: GameScene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y);

    this.base = scene.add.image(this.x, this.y, 'laser-turret-base')
      .setDisplaySize(54, 54);

    this.top = scene.add.sprite(this.x, this.y, 'laser-turret-top')
      .setDisplaySize(54, 54);
    this.top.anims.create({
      key: 'laser-turret-glow',
      frames: scene.anims.generateFrameNumbers('laser-turret-top', { start: 0, end: 10 }),
      frameRate: 7,
      repeat: -1
    });
    this.top.anims.play('laser-turret-glow', true);

    this.laserEnd = { x: 0, y: 0 };
    this.laser = scene.add.line();
    this.laser.setOrigin(0, 0);
    this.laser.setStrokeStyle(3, 0xff0000);
    this.laser.postFX.addBloom(0xffffff, 1, 1, 1, 3, 4);
    this.particles = scene.add.particles(0, 0, 'flares', {
      frame: 'red',
      color: [0xffffff, 0xff0000],
      colorEase: 'quint.out',
      lifespan: { min: 100, max: 1000 },
      angle: { min: -140, max: -40 },
      scale: { start: 0.2, end: 0, random: true },
      speed: { min: 80, max: 120 },
      blendMode: 'ADD',
      emitting: false
    });

    this.timeline = scene.add.timeline([
      {
        at: 0,
        run: () => {
          this.status = 'TRACKING';
          this.laser.setLineWidth(1);
        }
      },
      {
        from: this.durations.tracking,
        run: () => {
          this.status = 'CHARGING';
          this.laser.setLineWidth(1);
        }
      },
      {
        from: this.durations.charging,
        run: () => {
          this.status = 'FIRING';
          this.laser.setLineWidth(8);
          this.particles.setPosition(this.laserEnd.x, this.laserEnd.y);
          this.particles.setAngle(this.top.angle + 180);
          this.particles.emitting = true;
        }
      },
      {
        from: this.durations.firing,
        run: () => {
          this.status = 'IDLE';
          this.laser.setLineWidth(0);
          this.particles.emitting = false;
        }
      }
    ]);

    scene.add.existing(this);
  }

  override update(scene: Phaser.Scene, player: Player) {
    const playerRaycast = raycast({
      scene: scene,
      start: { x: this.x, y: this.y },
      end: player.sprite.getCenter(),
      labelToTest: 'player-body'
    });
    if (!playerRaycast.madeContact) {
      if ((this.status != 'CHARGING' && this.status != 'FIRING') && this.timeline.isPlaying()) {
        this.timeline.stop();
        this.laser.setLineWidth(0);
        this.particles.emitting = false;
      }
      return;
    }

    if (!this.timeline.isPlaying())
      this.timeline.play();

    if (this.status == 'TRACKING') {
      const angle = getAngleRadians(this.x, this.y, player.sprite.x, player.sprite.y);
      this.top.setRotation(angle + Phaser.Math.DegToRad(90));
      const wallRaycast = raycastAtAngle({
        scene: scene,
        start: { x: this.x, y: this.y },
        angle: angle,
        labelToIgnore: 'player-body'
      });
      this.laserEnd = wallRaycast.point;
      this.laser.setTo(this.x, this.y, this.laserEnd.x, this.laserEnd.y);
    }

    if (this.status == 'FIRING') {
      const playerRaycast = raycast({
        scene: scene,
        start: { x: this.x, y: this.y },
        end: { x: this.laserEnd.x, y: this.laserEnd.y },
        labelToTest: 'player-body'
      });
      if (playerRaycast.madeContact)
        player.damage(10);
    }
  }
}
