export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'LoadingScene'
    });
  }

  preload(): void {
    const progress = this.add.graphics();

    this.load.on('progress', (value: number) => {
      const padding = 300;
      progress.clear();
      progress.fillStyle(0x15cc1a, 1);
      progress.fillRect(0 + padding, this.scale.height / 2, (this.scale.width * value) - (padding * 2), 18);
    });

    this.load.on('complete', () => {
      progress.destroy();
    });

    this.load.image('coin',           'images/coin.png');
    this.load.image('aura',           'images/aura-black.png');
    this.load.image('missile',        'images/missile.png');
    this.load.image('missile-turret', 'images/missile-turret.png');
    this.load.image('door-open',      'images/door-1-open.png');
    this.load.image('explosion',      'images/explosion.png');
    this.load.image('key',            'images/key.svg');
    this.load.tilemapTiledJSON(
      'map2.json',
      'maps/map2.json'
    );
    this.load.tilemapTiledJSON(
      'map3.json',
      'maps/map3.json'
    );
    this.load.spritesheet( // Spritesheets contain frames for animations.
      'player',
      'spritesheets/player-black-29x37.png',
      { frameWidth: 29, frameHeight: 37 }
    );
    this.load.image({
      key: 'tileset',
      url: 'tilesets/tileset-simple-32x32.png'
    });
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
