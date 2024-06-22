import { AbilityState } from 'src/model/schema/data/ability-schema';
import { Ability } from './ability';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';


export abstract class PassiveAbility extends Ability {

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
        this.schema.type = 'passive';
    }

    /**
     * Other abilities might enable/disable passive abilities.
     */
    override onEnable() {
        this.start();
    }

    override start(): void {
        this._schema.state = AbilityState.active;
        this.onStart?.();
    }

    override canUse() { return false; }

}