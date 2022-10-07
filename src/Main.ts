import 'phaser';
import { Physics, Scale } from 'phaser';
import { Scene1 } from './scenes/Scene1';
import { PreloadAssets } from './scenes/PreloadAssets';

const myScaleConfig : Phaser.Types.Core.ScaleConfig = {
  mode: Phaser.Scale.MAX_ZOOM, // Phaser.Scale.FIT
  autoCenter: Phaser.Scale.CENTER_BOTH,
  // parent: 'game',
  width: 1152, // 32px * 36 tiles
  height: 704  // 32px * 22 tiles
}

const myGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: 0x333333,
  scale: myScaleConfig,
  parent: 'game',
  scene: [PreloadAssets, Scene1],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: true
    }
  }
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  const game = new Game(myGameConfig);
});

//new Phaser.Game(myGameConfig);