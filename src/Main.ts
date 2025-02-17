import { Game, Types } from 'phaser';
import PhaserRaycaster from 'phaser-raycaster';
import { LoadingScene } from './scenes/LoadingScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 32 * 38, // px x tiles.
  height: 32 * 22, // px x tiles // All maps must be at least this big.
  parent: 'game-container',
  backgroundColor: '#6e787a',
  scale: {
    mode: Phaser.Scale.MAX_ZOOM, // [old] Phaser.Scale.FIT
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [LoadingScene, MenuScene, GameScene],
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
