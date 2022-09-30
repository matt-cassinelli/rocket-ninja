import 'phaser';
import { Physics, Scale } from 'phaser';
import { Scene1 } from './scenes/Scene1';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.MAX_ZOOM,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // parent: 'game',
    width: 1152, // 32px * 36 tiles
    height: 704  // 32px * 22 tiles
  },
  backgroundColor: 0x333333,
  parent: 'game',
  scene: [Scene1],
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
  const game = new Game(GameConfig);
});