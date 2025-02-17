export default class LevelButton extends Phaser.GameObjects.Container {
  private rectangle: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private color = {
    normal: { fg: '#ffffff', bg: 0x333333, border: 0x888888 },
    disabled: { fg: '#888888', bg: 0x333333, border: 0x888888 },
    hover: { fg: '#ffffff', bg: 0x335555, border: 0x88aaaa },
    down: { fg: '#ffffff', bg: 0x77aaaa, border: 0x99cccc }
  };

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, text: string, onClick: () => void, disabled: boolean = false) {
    super(scene, x, y);
    this.setSize(width, height);

    const fontSize = 22;
    this.text = scene.add.text(0, 0, text, { fontSize: fontSize, fixedWidth: width, fixedHeight: height, align: 'center' })
      .setOrigin(0)
      .setY(this.height / 2 - fontSize / 2);

    this.rectangle = new Phaser.GameObjects.Rectangle(scene, 0, 0, width, height, 0xaaaaaa, 0.8)
      .setOrigin(0)
      .setStrokeStyle(2);

    this.draw(State.Normal);

    if (disabled) {
      this.disableInteractive();
    }
    else {
      // Unfortunately Phaser can't calculate the hit area automatically.
      const hitArea = new Phaser.Geom.Rectangle(width / 2, height / 2, width, height);
      this.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains)
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.draw(State.Normal))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.draw(State.Hover))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.draw(State.Down))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
          this.draw(State.Hover);
          onClick();
        });
    }

    this.add(this.rectangle);
    this.add(this.text);
  }

  private draw(state: State) {
    switch (state) {
      case State.Normal: {
        this.text.setColor(this.color.normal.fg);
        this.rectangle.fillColor = this.color.normal.bg;
        this.rectangle.strokeColor = this.color.normal.border;
        break;
      }
      case State.Hover: {
        this.text.setColor(this.color.hover.fg);
        this.rectangle.fillColor = this.color.hover.bg;
        this.rectangle.strokeColor = this.color.hover.border;
        break;
      }
      case State.Down: {
        this.text.setColor(this.color.down.fg);
        this.rectangle.fillColor = this.color.down.bg;
        this.rectangle.strokeColor = this.color.down.border;
        break;
      }
      case State.Disabled: {
        this.text.setColor(this.color.disabled.fg);
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

enum State {
  Normal,
  Hover,
  Down,
  Disabled
}
