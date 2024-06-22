import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { PassiveAbility } from './passive-ability';
import { MatterData } from '../../hits/matter-data';
import { HitCategory } from '../../../../model/matter';


/**
 * Walk over water hits.
 */
export class Swim extends PassiveAbility {

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    onStart() {
        const hit = this.get(MatterData);
        if (hit) {
            hit.hitMask &= ~(HitCategory.Water);
        }
    }

    onEnd() {
        const hit = this.get(MatterData);
        if (hit) {
            hit.hitMask |= HitCategory.Water;
        }

    }

}