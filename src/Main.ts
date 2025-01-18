import 'phaser';
import { GameScene } from './scenes/GameScene';
import { LoadingScene } from './scenes/LoadingScene';
import PhaserRaycaster from 'phaser-raycaster';

const myScaleConfig : Phaser.Types.Core.ScaleConfig = {
  mode: Phaser.Scale.MAX_ZOOM, // [old] Phaser.Scale.FIT
  autoCenter: Phaser.Scale.CENTER_BOTH,
  // [old] parent: 'game',
  width: 1184, // 32px * 37 tiles
  height: 704  // 32px * 22 tiles
};

const myGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: 0x333333,
  scale: myScaleConfig,
  parent: 'game',
  scene: [LoadingScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  plugins: {
    scene: [{
      key: 'PhaserRaycaster',
      plugin: PhaserRaycaster,
      mapping: 'raycasterPlugin'
    }]
  }
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  new Game(myGameConfig);
});
