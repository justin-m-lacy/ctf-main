import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { MatterPlayer } from '../../hits/matter-player';
import { TriggerAbility } from './trigger-ability';
import { HitCategory } from '../../../../model/matter';


/**
 * Activates invisible mode.
 */
export class Phase extends TriggerAbility {

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    onStart() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask &= ~(HitCategory.Wall);
        }
    }

    onEnd() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask |= HitCategory.Wall;
        }

    }

}