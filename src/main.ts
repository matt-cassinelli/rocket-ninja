import PhaserMatterCollisionPlugin from 'phaser-matter-collision-plugin';
import { Game, Types } from 'phaser';
import { LoadingScene } from './scenes/loading-scene';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';

const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width:  32 * 38, // Pixels * tiles. All maps must be at least this big.
  height: 32 * 22, //
  parent: 'game-container',
  backgroundColor: '#6e787a',
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [LoadingScene, MenuScene, GameScene],
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1.15 },
      enableSleeping: false,
      debug: false
    }
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin,
        key: 'collisionPlugin', // Where to store in Scene.Systems (e.g. scene.sys.collisionPlugin)
        mapping: 'collisionPlugin' // Where to store in the Scene (e.g. scene.collisionPlugin)
      }
    ]
  }
};

export default new Game(config);
