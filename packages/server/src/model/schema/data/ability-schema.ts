import { Schema, type } from '@colyseus/schema';
import { TAbilityDef, TAbilityType } from '../../../ctf/data/ability';
import { PointSchema } from './point-schema';

export enum AbilityState {
    available = 0,
    active = 1,
    cooldown = 2,
    removed = 3

}

/**
 * Describes ability in progress.
 */
export class AbilitySchema extends Schema {

    @type("string") id: string = ''

    @type('number') cooldown: number = 0;


    /**
     * Total duration in seconds.
     */
    @type('number') duration: number = 0;


    @type('uint8') state: AbilityState = AbilityState.available;

    @type('string') type: TAbilityType = 'trigger';

    /**
     * Tracking information for an ability that has an active
     * tracking target.
     */
    @type(PointSchema) trackPos?: PointSchema;

    /**
     * Current destination of the ability.
     */
    @type(PointSchema) dest?: PointSchema;

    /**
  * Tick last used.
  * Value is negative by default to allow access
  * to abilities on game start.
  */
    lastUsed: number = -99999;


    minDist?: number;

    maxDist?: number;

    maxAngle?: number;

    damage?: number;

    /**
     * Raw ability data.
     */
    data?: TAbilityDef;

    /**
     * Internal Parameters to pass to Ability component.
     */
    params?: {
        [key: string]: number
    }

    constructor(def: TAbilityDef) {

        super();

        this.data = def;

        this.id = def.id;
        this.cooldown = def.cooldown ?? 0;
        this.duration = def.duration ?? 0;
        if (def.type) {
            this.type = def.type;
        }

        this.minDist = def.minDist;
        this.maxDist = def.maxDist;
        this.maxAngle = def.maxAngle;

    }

}