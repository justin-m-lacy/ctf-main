import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { MatterPlayer } from '../../hits/matter-player';
import { TriggerAbility } from './trigger-ability';
import { HitCategory } from '../../../../model/matter';


/**
 * Activates invincible mode.
 */
export class Invincible extends TriggerAbility {

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    onStart() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask &= ~(HitCategory.Damager | HitCategory.Bullet);
        }
    }

    onEnd() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask |= (HitCategory.Damager | HitCategory.Bullet);
        }

    }

}