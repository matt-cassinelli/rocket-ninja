import { ProgressBar } from '../objects/progress-bar';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x222222);

    const progressBar = new ProgressBar(this);
    this.load.on('progress', (value: number) => {
      progressBar.progress(value);
    });

    this.load.on('complete', () => {
      progressBar.complete();
    });

    this.loadSpritesheets();
    this.loadSounds();
    this.loadMaps();
    this.loadImages();
    this.loadFonts();
  }

  create() {
    this.scene.start('MenuScene');
  }

  loadImages() {
    this.load.image('tileset',           'tilesets/tileset-simple-32x32.png');
    this.load.image('missile',           'images/missile.png');
    this.load.image('missile-turret',    'images/missile-turret-base.png');
    this.load.image('laser-turret-base', 'images/laser-turret-base.png');
    this.load.image('key',               'images/key.svg');
    this.load.image('spike',             'images/spike.png');
    this.load.image('exit-icon',         'images/box-arrow-left.svg');
    this.load.image('lock',              'images/lock.svg');
    this.load.image('background',        'images/chromatic-camouflage-5.png'); // Note: Backgrounds should have POT dimensions.
    this.load.image('explosion',         'particles/explosion.png');
    this.load.image('cloud-white',       'particles/cloud-white.png');
    this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');
  }

  loadMaps() {
    for (let i = 1; i <= 8; i++) {
      this.load.tilemapTiledJSON(
        `map${i}.json`,
        `maps/map${i}.json`
      );
    }
  }

  // Spritesheets contain frames for animations.
  loadSpritesheets() {
    this.load.spritesheet(
      'player',
      'spritesheets/player-70x70.png',
      { frameWidth: 70, frameHeight: 70 }
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
    this.load.spritesheet(
      'laser-turret-top',
      'spritesheets/turret-02-mk2-128.png',
      { frameWidth: 128, frameHeight: 128 }
    );
  }

  loadSounds() {
    this.load.audio('missile-launch', 'sounds/missile-launch.mp3');
    this.load.audio('explosion', 'sounds/explosion.mp3');
    this.load.audio('door-open', 'sounds/door-open.mp3');
    this.load.audio('manna', 'sounds/crystal-glass.mp3');
    this.load.audio('jump-pad', 'sounds/jump-pad.mp3');
    this.load.audio('running', 'sounds/running.mp3');
    this.load.audio('jump', 'sounds/jump.mp3');
    this.load.audio('wall-slide', 'sounds/wall-slide.mp3');
  }

  loadFonts() {
    this.load.font('flower', 'fonts/indie-flower/IndieFlower-Regular.ttf', 'truetype');
  }
}
