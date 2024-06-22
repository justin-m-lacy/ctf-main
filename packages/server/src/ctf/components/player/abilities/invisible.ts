import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { Player } from '../player';
import { TriggerAbility } from './trigger-ability';


/**
 * Activates invisible mode.
 */
export class Invisible extends TriggerAbility {

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    onStart() {
        this.get(Player)!.schema.hidden = true;
    }

    onEnd() {
        this.get(Player)!.schema.hidden = false;
    }

}