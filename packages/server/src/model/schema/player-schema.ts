import { Schema, type, ArraySchema } from '@colyseus/schema';
import { PointSchema } from './data/point-schema';
import { DriverSchema } from './data/driver-schema';
import { AbilitySchema } from './data/ability-schema';
import { Partialize } from '../../utils/types';
import { PlayerStats } from './data/stats-schemas';
import { PlayerState, BASE_SPEED } from './types';
import { HitCategory } from '../matter';

const PlayerHitMask = HitCategory.Wall |
    HitCategory.Bullet |
    HitCategory.Water |
    HitCategory.Spawn |
    HitCategory.Mud |
    HitCategory.Hittable |
    HitCategory.Damager;


export class PlayerSchema extends Schema {

    @type('string') id: string = '';
    @type('string') name: string = '';

    /**
     * Whether player is visible.
     */
    @type('boolean') hidden: boolean = false;

    /**
     * Specific craft type.
     */
    @type('string') craft: string = '';

    @type('number') maxHp: number = 100;
    @type('number') hp: number = 100;

    /**
     * flags represent transient information useful for display
     * and must be cleared periodically.
     */
    //@type('number') flags: PlayerFlags = 0;

    /**
     * id of primary ability.
     */
    @type(AbilitySchema) primary?: AbilitySchema;

    /**
     * State of usable abilities.
     */
    @type({ array: AbilitySchema }) abilities: ArraySchema<AbilitySchema> = new ArraySchema();

    @type("string") team: string = '';

    @type(PointSchema) pos: PointSchema = new PointSchema();

    @type("number") angle: number = 0;

    @type("number") stopRadius: number = 36;
    @type("number") slowRadius: number = 120;

    @type("number") radius: number = 36;

    /**
     * Mana amount from 0 to 1
     */
    @type('number') manaPct: number = 1;

    /**
     * Accumulated charging time, in seconds.
     */
    @type("number") chargeTime: number = 0;

    @type("number") state: PlayerState = PlayerState.disabled;

    @type(PlayerStats) stats: PlayerStats = new PlayerStats();

    /**
     * Hit mask.
     */
    @type('uint32') hitMask: number = PlayerHitMask;

    @type(DriverSchema) motion: DriverSchema = new DriverSchema({

        angle: 0,
        speed: 0,
        omega: 0,
        accel: 0,
        alpha: 0,
        maxAccel: 2800,
        brakeAccel: 7000,
        maxSpeed: BASE_SPEED,
        maxOmega: 300 * (Math.PI / 180),
        maxAlpha: 360 * (Math.PI / 180),


    });

    constructor(args: { id: string } & Partialize<PlayerSchema>) {
        super(args);

        if (args.motion) {
            Object.assign(this.motion, args.motion);
        }
        let k: keyof PlayerSchema;
        for (k in args) {

            const val = this[k];
            if (val instanceof Schema) {
                continue;
            } else if (typeof val === typeof args[k]) {
                /// @ts-ignore
                this[k] = args[k];

            }

        }

        this.hp = this.maxHp;
    }

}