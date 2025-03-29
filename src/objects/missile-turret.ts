import { Missile } from './missile';
import { GameScene } from '../scenes/game-scene';
import { Player } from './player';
import { raycast } from '../helpers/raycaster';

export class MissileTurret extends Phaser.GameObjects.Image {
  missile?: Missile;
  id: number;
  private size = 54;

  constructor(scene: GameScene, object: Phaser.Types.Tilemaps.TiledObject) {
    super(scene, object.x, object.y, 'missile-turret');
    this.id = object.id;
    this.setDisplaySize(this.size, this.size);
    scene.add.existing(this);
    // TODO: Delay firing
    // TODO: Delay firing if player really close
    // TODO: Allow multiple missiles? this.missiles = [];
  }

  override update(scene: GameScene, player: Player, missileGroup: Phaser.GameObjects.Group) {
    if (this.missile?.active == true) return;
    if (player.health <= 0 || !player.sprite.body) return;
    const playerRaycast = raycast({
      scene: scene,
      start: this.getCenter(),
      end: player.sprite.getCenter(),
      labelToTest: 'player-body'
    });
    if (!playerRaycast.madeContact) return;
    this.missile = new Missile(scene, this.x, this.y, player);
    missileGroup.add(this.missile);
    scene.sound.play('missile-launch', { volume: 0.8 });
  }
}
