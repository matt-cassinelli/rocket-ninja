import { ButtonState } from './ButtonState';

export class LevelButton extends Phaser.GameObjects.Container {
  private rectangle: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;
  private color = {
    normal: { fg: '#ffffff', bg: 0x282828, border: 0xcccccc },
    disabled: { fg: 0x666666, bg: 0x282828, border: 0x777777 },
    hover: { fg: '#ffffff', bg: 0x285577, border: 0xcccccc },
    down: { fg: '#ffffff', bg: 0x55bbff, border: 0x55bbff }
  };

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number,
    text: string, onClick: () => void, disabled: boolean) {
    super(scene, x, y);

    this.setSize(width, height);

    this.rectangle = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, null, 1)
      .setOrigin(0)
      .setStrokeStyle(2);
    this.add(this.rectangle);

    if (disabled === true) {
      const lock = scene.add.image(this.width / 2, this.height / 2, 'lock')
        .setOrigin(0.5)
        .setDisplaySize(this.height * 0.6, this.height * 0.6)
        .setTintFill(this.color.disabled.fg);
      this.add(lock);
      this.draw(ButtonState.Disabled);
      this.disableInteractive();
    }
    else {
      const fontSize = 28;
      const fontYBias = -3;
      this.text = scene.add.text(0, 0, text, {
        fontFamily: 'flower',
        fontSize: fontSize,
        fixedWidth: width,
        fixedHeight: height,
        align: 'center'
      })
        .setOrigin(0)
        .setY(this.height / 2 - fontSize / 2 + fontYBias);
      this.add(this.text);
      this.draw(ButtonState.Normal);
      // Unfortunately Phaser can't calculate the hit area automatically.
      const hitArea = new Phaser.Geom.Rectangle(width / 2, height / 2, width, height);
      this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.draw(ButtonState.Normal))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.draw(ButtonState.Hover))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.draw(ButtonState.Down))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          this.draw(ButtonState.Hover);
          onClick();
        });
    }
  }

  private draw(state: ButtonState) {
    switch (state) {
      case ButtonState.Normal: {
        this.text.setColor(this.color.normal.fg);
        this.rectangle.fillColor = this.color.normal.bg;
        this.rectangle.strokeColor = this.color.normal.border;
        break;
      }
      case ButtonState.Hover: {
        this.text.setColor(this.color.hover.fg);
        this.rectangle.fillColor = this.color.hover.bg;
        this.rectangle.strokeColor = this.color.hover.border;
        break;
      }
      case ButtonState.Down: {
        this.text.setColor(this.color.down.fg);
        this.rectangle.fillColor = this.color.down.bg;
        this.rectangle.strokeColor = this.color.down.border;
        break;
      }
      case ButtonState.Disabled: {
        this.rectangle.fillColor = this.color.disabled.bg;
        this.rectangle.strokeColor = this.color.disabled.border;
        break;
      }
    }

    //const roundness = 5;
    //this.shape.fillRoundedRect(0, 0, this.width, this.height, roundness);
    //this.shape.strokeRoundedRect(0, 0, this.width, this.height, roundness);
  }
}
