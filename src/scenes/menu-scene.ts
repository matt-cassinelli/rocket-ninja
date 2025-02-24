import { LevelGrid } from '../objects/navigation/level-grid';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x282828);

    // Title
    const titleXPad = this.scale.width / 20;
    const titleYPad = this.scale.height / 20;
    this.add.text(0 + titleXPad, 0 + titleYPad, 'Menu', {
      fontFamily: 'flower', fontSize: 64, fontStyle: 'bold', color: '#ffffff'
    });

    // Level grid
    const gridXPad = this.scale.width / 30;
    const x = 0 + gridXPad;
    const y = this.scale.height / 5;
    const width = this.scale.width - (gridXPad * 2);
    const height = this.scale.height / 2;
    const levelGrid = new LevelGrid(this, x, y, width, height);
    this.add.existing(levelGrid);
  }
}
