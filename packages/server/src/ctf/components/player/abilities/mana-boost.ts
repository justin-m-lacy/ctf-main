import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { TriggerAbility } from './trigger-ability';
import { Player } from '../player';


/**
 * Increases mana regeneration.
 */
export class ManaBoost extends TriggerAbility {

    private player!: Player;

    private fillRate: number = 0.1;

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    init() {
        super.init();
        this.player = this.require(Player);
    }

    update(delta: number) {

        super.update(delta);

        const mana = this.player.schema.manaPct + this.fillRate * delta;
        this.player.schema.manaPct = mana > 1 ? 1 : mana;

    }
}