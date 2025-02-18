import DB from '../../helpers/Database';
import levels from '../../data/levels';
import LevelButton from './LevelButton';

export class LevelGrid extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.setSize(width, height);

    const bgRect = scene.add.rectangle(0, 0, this.width, this.height, 0x000000, 0)
      .setOrigin(0)
      .setStrokeStyle(2, 0x666666);
    this.add(bgRect);

    const btnWidth = 140;
    const btnHeight = 80;
    const itemsPerRow = 6;
    const rowCount = Math.ceil(levels.length / itemsPerRow);
    const cellWidth = width / itemsPerRow;
    const cellHeight  = height / rowCount;
    const cellXOffset = (cellWidth - btnWidth) / 2;   // Place in center of cell - equivalent to CSS 'space-evenly'.
    const cellYOffset = (cellHeight - btnHeight) / 2; //

    const unlocked = DB.getUnlockedLevels();

    for (let i = 0; i < levels.length; i++) {
      const row = Math.floor(i / itemsPerRow);
      const column = i % itemsPerRow;
      const btnX = (column * cellWidth) + cellXOffset;
      const btnY = (row * cellHeight) + cellYOffset;
      const onClick = () => scene.scene.start('GameScene', { mapKey: levels[i].file });
      const isDisabled = !unlocked.includes(levels[i].file);
      const button = new LevelButton(scene, btnX, btnY, btnWidth, btnHeight, levels[i].name, onClick, isDisabled);
      this.add(button);
    }
  }
}
