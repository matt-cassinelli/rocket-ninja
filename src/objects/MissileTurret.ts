import { Missile } from "./Missile"

export class MissileTurret extends Phaser.GameObjects.Image
{
    private DELAY: number = 100; // ms
    private SIZE: number = 50;
    // [idea] missiles: Missile[] = []
    missile?: Missile

    constructor(scene:Phaser.Scene, x:number, y:number)
    {
        super(scene, x, y, 'missile-turret')
        scene.add.existing(this)
        // [old] scene.physics.add.existing(this) // Physics not needed
        this.scene = scene;
        this.setDisplaySize(this.SIZE, this.SIZE)
        this.addToUpdateList()

        // [idea]
        // new Phaser.Time.TimerEvent( [todo] Add timer?
        //     {delay: 100, repeat: 20}
        // )
        //this.missiles = [];
    }

    fire(initialtargetX:number, initialTargetY:number) {
        // [todo] play sound, then wait a bit before firing
        // this.missiles.push(
        //     new Missile(this.scene, this.x, this.y, this.target)
        // )
        this.missile = new Missile(this.scene, this.x, this.y, initialtargetX, initialTargetY)
        return this.missile
    }

    // [idea] updateMissile {}

    // [todo] check line of sight to player. canSeePlayer(player) {}
}