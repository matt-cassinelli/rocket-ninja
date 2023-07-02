import { Physics } from 'phaser';
import { InputHandler } from '../helpers/InputHandler';
import { Player } from '../objects/Player';
import { Coin } from '../objects/Coin';
import { Missile } from '../objects/Missile';
import { MissileTurret } from '../objects/MissileTurret';
import { Door } from '../objects/Door';
import PhaserRaycaster from 'phaser-raycaster';

export class GameScene extends Phaser.Scene
{
    private mapKey:               string;
    private map!:                 Phaser.Tilemaps.Tilemap;
    private tileset!:             Phaser.Tilemaps.Tileset;
    tileLayerSolids!:             Phaser.Tilemaps.TilemapLayer;
    private tileLayerBackground!: Phaser.Tilemaps.TilemapLayer;
    private objectLayer!:         Phaser.Tilemaps.ObjectLayer;
    private objectShapeLayer:     Phaser.Tilemaps.ObjectLayer;

    raycasterPlugin:              PhaserRaycaster;
    private inputHandler!:        InputHandler;
  
    private coinGroup!:           Phaser.Physics.Arcade.StaticGroup;
    private missileTurretGroup!:  Phaser.GameObjects.Group; // [old] private missileTurrets?: MissileTurret[];
    missileGroup!:                Phaser.GameObjects.Group; // [old] Phaser.Physics.Arcade.Group;
    // [todo] private bombs?:     Phaser.Physics.Arcade.Group;

    player!:                      Player;
    private door?:                Door;

    private gold = 0;
    private goldText?:            Phaser.GameObjects.Text;
    private healthText!:          Phaser.GameObjects.Text;

    constructor() {
        super('GameScene');
    }

    init(props: any) { // This gets called on scene.restart(). Called before preload() and create().
    // [dbg] console.log("Init method props: " + props);
        const { mapKey } = props;
        if (mapKey) {
            this.mapKey = mapKey;
        } else {
            this.mapKey = 'map2.json';
        }
    }

    create() {
        this.inputHandler = new InputHandler(this);

        // Load map
        // [dbg] console.log("mapKey: " + this.mapKey);
        this.map = this.make.tilemap({key: this.mapKey}); // [old] this.add.tilemap("map");
        // [dbg] console.log("Map: " + this.map);

        // Load tileset
        this.tileset = this.map.addTilesetImage('tileset', 'tileset');

        // Load layers from map
        this.tileLayerSolids     = this.map.createLayer('tile-layer-solids', this.tileset); // [old] this.platforms.
        this.tileLayerBackground = this.map.createLayer('tile-layer-background', this.tileset);
        this.objectLayer      = this.map.getObjectLayer('object-layer');
        this.objectShapeLayer = this.map.getObjectLayer('object-layer-shapes');

        // Create groups to hold objects (convenient for handling collisions for all objects of a certain type)
        this.coinGroup = this.physics.add.staticGroup({});
        this.missileTurretGroup = this.add.group();
        this.missileGroup = this.physics.add.group();
        //  

        // Instantiate objects for each coordinate in our object layer
        this.objectLayer.objects.forEach((object) => {

            if (object.name === 'coin') {
                this.coinGroup.add(
                    new Coin(this, object.x, object.y)
                );
            }

            if (object.name === 'missile-turret') {
                // [dbg] console.log(object);
                this.missileTurretGroup.add(
                    new MissileTurret(
                        this,
                        object.x,
                        object.y,
                        object.id
                    )
                );
            }

            if (object.name === 'player') {
                // [todo] keep player health when change level
                // if (this.player === undefined) ...
                this.player = new Player(this, object.x, object.y); 
                // else
                // this.add.existing(player)
            }

            if (object.name === 'door') {
                this.door = new Door(this, object);
            }
        });

        const padding = 36;
        this.goldText  = this.add.text(this.scale.width - (padding * 2) - 64,  padding, `${this.gold}`, {fontSize: '48px', color:'#f9c810', align: 'right', fixedWidth: 100});
        this.healthText = this.add.text(padding, padding, `${this.player.health}`, {fontSize: '48px', color:'#e41051'});

        // #region ADD COLLIDERS

        this.tileLayerSolids.setCollisionByExclusion([-1]); // This is basically ".setCollisionForAll()". Without it, only the 1st tile from tileset collides.
        this.physics.add.collider(this.player, this.tileLayerSolids); // Are both of these needed?

        // [todo] this.physics.add.collider(this.bombs, this.platformLayer)
        // [todo] this.physics.add.collider(this.player, this.bombs, this.player.die, undefined, this.player)

        this.physics.add.collider(
            this.missileGroup, // [old] missileGroup.missiles
            this.tileLayerSolids,
            function(missile: any, platformLayer: any) { // Anonymous function
                missile.explode();
            },
            undefined,
            this
        );

        this.physics.add.collider(
            this.player,
            this.missileGroup,
            function (player: Player, missile: Missile): void {
                missile.explode();
                player.damage(70);
                this.healthText.setText(`${this.player.health}`);
                return;
            },
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.coinGroup,
            (player, coin): void => {
                (coin as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody).destroy();
                this.gold += (coin as Coin).value;
                this.goldText?.setText(`${this.gold}`);
                // [todo] Add sound fx.
            },
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.door,
            function () {
                this.scene.restart({ mapKey: this.door.leadsTo });
            },
            undefined,
            this
        );

    // #endregion
    }

    update() {
        if (this.player.health < 1) {
            this.physics.pause();
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: '48px' }).setOrigin(0.5, 0.5);
            this.time.addEvent({
                delay: 2500,
                callback: () => this.scene.restart()
            });
        }

        this.inputHandler.update();
        this.player.move(this.inputHandler);

        this.missileGroup.getChildren().forEach(m =>
            (m as Missile).update(this.player.x, this.player.y)
        );
    }
}