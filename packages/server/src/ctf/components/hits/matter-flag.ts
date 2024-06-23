import { MatterData } from './matter-data';
import { Bodies, IBodyDefinition, Pair } from 'matter-js';
import { PlayerSchema } from '../../../model/schema/player-schema';
import { InternalEvent } from '../../data/consts';
import { FlagSchema, FlagState } from '@/model/schema/flag-schema';
import { HitCategory } from '../../../model/matter';

const FlagBody: IBodyDefinition = {

    frictionAir: 0,
    friction: 0,
    collisionFilter: {
        category: HitCategory.Flag,
        mask: HitCategory.Player
    }
}

/**
 * NOT YET IN USE.
 */
export class MatterFlag extends MatterData<FlagSchema> {

    constructor(schema: FlagSchema) {
        super(
            Bodies.circle(0, 0, schema.size, FlagBody), schema
        );
    }

    init() {
        super.init();
    }

    collide(pair: Pair, other?: MatterData) {

        const state = this.data.state;
        if (state === FlagState.spawning || state === FlagState.carried) {
            /// Flag not hittable.
            return;
        }

        if (other) {

            if (other.data instanceof PlayerSchema) {
                this.game.emit(InternalEvent.FlagHit, other.data, this.data);
            }

        }

    }

}