import { LevelGrid } from '../objects/LevelGrid';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x282828);
    const xPad = this.scale.width / 50;
    const yPad = this.scale.height / 30;

    this.add.text(0 + xPad, 0 + yPad, 'Menu', { fontFamily: 'flower', fontSize: 60, fontStyle: 'bold', color: '#ffffff' });

    // Level grid
    const x = 0 + xPad;
    const y = this.scale.height / 6;
    const width = this.scale.width - (xPad * 2);
    const height = (this.scale.height - y) - (yPad);
    const levelGrid = new LevelGrid(this, x, y, width, height);
    this.add.existing(levelGrid);
  }
}
