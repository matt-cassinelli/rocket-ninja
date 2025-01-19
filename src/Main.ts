import { Game, Types } from 'phaser';
import { GameScene } from './scenes/GameScene';
import { LoadingScene } from './scenes/LoadingScene';
import PhaserRaycaster from 'phaser-raycaster';

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1184, // 32px * 37 tiles
  height: 704, // 32px * 22 tiles
  parent: 'game-container',
  backgroundColor: 0x333333,
  scale: {
    mode: Phaser.Scale.MAX_ZOOM, // [old] Phaser.Scale.FIT
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [LoadingScene, GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 400 },
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

export default new Game(config);
