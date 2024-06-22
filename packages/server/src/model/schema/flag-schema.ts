import { Schema, type } from '@colyseus/schema';
import { PointSchema } from './data/point-schema';
import { TPoint } from '../../engine/data/geom';

export enum FlagState {

    /**
     * flag is at base.
     */
    base = 0,
    /**
     * flag was taken by a player.
     */
    carried = 1,

    /**
     * flag was dropped.
     */
    dropped = 2,

    /**
     * Frame delay before return.
     */
    returned = 3,

    /**
     * Flag in process of spawning.
     */
    spawning = 4

}

export class FlagSchema extends Schema {

    /**
     * Owning team of flag.
     */
    @type("string") team: string = '';

    @type("uint8") state: FlagState = FlagState.spawning;

    @type(PointSchema) pos: PointSchema = new PointSchema(-999999, -999999);

    @type(PointSchema) spawn: PointSchema = new PointSchema();

    @type('uint16') size: number = 32;

    /**
     * Id of player carrying flag, if any.
     */
    @type('string') carrier?: string;

    constructor(params: {
        team: string,
        spawn: TPoint,
        size?: number
    }) {
        super();

        this.team = params.team;
        this.spawn.setTo(params.spawn);
        this.pos.setTo(params.spawn);
        if (params.size) {
            this.size = params.size;
        }


    }

}