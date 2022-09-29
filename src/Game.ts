import 'phaser';
import { Physics } from 'phaser';
import { Scene1 } from './scenes/Scene1';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0x333333,
  parent: 'game',
  scene: [Scene1],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
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