export class InputHandler {

    private scene: Phaser.Scene;

    private keyUp;
    private keyW;
    private keySpace;

    private keyLeft;
    private keyA;

    private keyRight;
    private keyD;

    private keyZ;
    private keyEnter;

    rightPressed: boolean = false;
    leftPressed: boolean = false;
    upPressed: boolean = false;
    attackPressed: boolean = false;
    //private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    //private keyboard //: Phaser.Types.Input.Keyboard
    
    constructor(scene: Phaser.Scene) {
        //this.cursors = this.input.keyboard.createCursorKeys()
        //this.keyboard = scene.input.keyboard
        this.scene = scene;

        this.keyUp    = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyW     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.keyLeft  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyA     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        this.keyRight = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keyD     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.keyZ     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyEnter = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        this.upPressed     = (this.keyUp.isDown || this.keyW.isDown || this.keySpace.isDown)
        this.leftPressed   = (this.keyLeft.isDown || this.keyA.isDown)
        this.rightPressed  = (this.keyRight.isDown || this.keyD.isDown)
        this.attackPressed = (this.keyZ.isDown || this.keyEnter.isDown)
    }
}