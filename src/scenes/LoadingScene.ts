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

    this.loadImages();
    this.loadSpritesheets();
    this.loadMaps();
    this.loadSounds();
  }

  create(): void {
    this.scene.start('GameScene');
  }

  loadImages() {
    this.load.image('tileset',        'tilesets/tileset-simple-32x32.png');
    this.load.image('missile',        'images/missile.png');
    this.load.image('missile-turret', 'images/missile-turret.png');
    this.load.image('key',            'images/key.svg');
    this.load.image('spike',          'images/spike.png');
    // Note: Backgrounds should have POT dimensions.
    this.load.image('background',     'images/chromatic-camouflage (5).png');
    this.load.image('explosion',      'particles/explosion.png');
    this.load.image('aura',           'particles/aura-black.png');
    this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');
  }

  loadMaps() {
    for (let i = 1; i <= 6; i++) {
      this.load.tilemapTiledJSON(
        `map${i}.json`,
        `maps/map${i}.json`
      );
    }
    // TODO: Use node or something to inspect maps folder.
  }

  // Spritesheets contain frames for animations.
  loadSpritesheets() {
    this.load.spritesheet(
      'player',
      'spritesheets/player-black-29x37.png',
      { frameWidth: 29, frameHeight: 37 }
    );
    this.load.spritesheet(
      'door',
      'spritesheets/tech-door-1-40x56.png',
      { frameWidth: 40, frameHeight: 56 }
    );
    this.load.spritesheet(
      'manna',
      'spritesheets/spr_coin_strip4.png',
      { frameWidth: 16, frameHeight: 16 }
    );
    this.load.spritesheet(
      'jump-pad',
      'spritesheets/jump-pad-2-16x16.png',
      { frameWidth: 16, frameHeight: 16 }
    );
  }

  loadSounds() {
    this.load.audio('missile-launch', 'sounds/missile-launch.mp3');
    this.load.audio('explosion', 'sounds/explosion.mp3');
    this.load.audio('door-open', 'sounds/door-open.mp3');
    this.load.audio('manna', 'sounds/crystal-glass.mp3');
    this.load.audio('jump-pad', 'sounds/jump-pad.mp3');
  }
}
