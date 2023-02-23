import { Missile } from "./Missile"
import PhaserRaycaster from 'phaser-raycaster'
import { Scene1 } from '../scenes/Scene1'

export class MissileTurret extends Phaser.GameObjects.Image
{
    private DELAY: number = 100; // ms
    private SIZE: number = 50;
    
    missile?: Missile;
    //vision: Phaser.GameObjects.Polygon;
    raycaster: Raycaster;
    ray: Raycaster.Ray;
    id: number;
    intersections: Phaser.Geom.Point[];

    constructor(scene:Scene1, x:number, y:number, id:number)
    {
        super(scene, x, y, 'missile-turret')

        scene.add.existing(this);
        // [old] scene.physics.add.existing(this) // Physics not needed
        this.scene = scene; // needed?
        this.setDisplaySize(this.SIZE, this.SIZE);
        
        // [todo] Delay firing to match sound
        // new Phaser.Time.TimerEvent(
        //     {delay: 100, repeat: 20}
        // )

        // [idea] Allow multiple missiles
        // this.missiles = [];

        this.id = id;

        this.raycaster = scene.raycasterPlugin.createRaycaster({debug: false});
        this.raycaster.mapGameObjects(scene.player, true);
        this.raycaster.mapGameObjects(scene.tileLayerSolids, false, {collisionTiles: [-1]});
        
        this.ray = this.raycaster.createRay({
            origin: {x: x, y: y},
            autoSlice: true,
            enablePhysics: true
        });

        this.intersections = this.ray.castCircle();

        scene.physics.add.overlap( // @ts-ignore
            this.ray, 
            scene.player,
            function (ray: any, player: Phaser.GameObjects.GameObject) {
                this.fire(scene.player.x, scene.player.y, scene.missileGroup)
            },
            this.ray.processOverlap.bind(this.ray),
            this
        )

        this.addToUpdateList();
    }

    fire(initialtargetX:number, initialTargetY:number, missileGroup:Phaser.GameObjects.Group) {
        if (this.missile?.active !== true) {
            this.missile = new Missile(this.scene, this.x, this.y, initialtargetX, initialTargetY /* [old], this*/)
            missileGroup.add(this.missile);
        }
        // [dbg] console.log("firing missile")
        // [todo] play sound, then wait a bit before firing
        // [idea] this.missiles.push(...
        // [old] return this.missile
    }

    update()
    {
        this.intersections = this.ray.castCircle();
    }

    // [idea] canSeePlayer(player) {}
}