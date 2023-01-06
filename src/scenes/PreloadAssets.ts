export class PreloadAssets extends Phaser.Scene {
 
    constructor() {
        super({
            key : 'PreloadAssets'
        });
    }
 
    preload(): void
    {
      this.load.image('coin',           'images/coin.png');
      this.load.image('aura',           'images/aura-black.png');
      this.load.image('missile',        'images/missile.png');
      this.load.image('missile-turret', 'images/missile-turret.png');
      this.load.image('door-open',      'images/door-1-open.png');
      this.load.tilemapTiledJSON(
        "map2.json",
        "maps/map2.json"
      );
      this.load.tilemapTiledJSON(
        "map3.json",
        "maps/map3.json"
      );
      this.load.spritesheet(
        'player', // Spritesheets contain frames for animations.
        'spritesheets/player-black-29x37.png',
        {frameWidth: 29, frameHeight: 37}
      );
      // [old] this.load.image('tilesets\tiles_packed.png', 'my-tileset')
      // [old] this.load.tilemapTiledJSON('tileset-dungeon-16x16', 'tilesets/tileset-dungeon-16x16.tsj');
      this.load.image({
        key: 'tileset',
        url: 'tilesets/tileset-dungeon-32x32.png',
      });
    }
 
    create(): void {
        this.scene.start('Scene1');
    }
}