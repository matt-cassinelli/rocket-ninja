// In a seperate Scene so it can load once

// CLASS TO PRELOAD ASSETS
 
// this class extends Scene class
export class PreloadAssets extends Phaser.Scene {
 
    // constructor    
    constructor() {
        super({
            key : 'PreloadAssets'
        });
    }
 
    // method to be execute during class preloading
    preload(): void
    {
      this.load.image('ground',         'platform.png');
      this.load.image('coin',           'coin.png');
      this.load.image('bomb',           'bomb.png');
      this.load.image('aura',           'aura-black.png');
      this.load.image('tile-solid',     'tile-solid.png');
      this.load.image('missile',        'missile.png');
      this.load.image('missile-turret', 'missile-turret.png');
      this.load.tilemapTiledJSON(
        "map",
        "map1.json",
      );
      this.load.spritesheet(
        'player', // Spritesheets contain frames for animations.
        'player-black-29x37.png',
        {frameWidth: 29, frameHeight: 37}
      );
    }
 
    // method to be called once the instance has been created
    create(): void {
        this.scene.start('Scene1');
    }
}