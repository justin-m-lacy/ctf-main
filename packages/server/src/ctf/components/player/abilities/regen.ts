import { AbilitySchema } from '../../../../model/schema/data/ability-schema';

import { PassiveAbility } from './passive-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { isAlive } from '../../../../model/schema/types';


/**
 * Passive regeneration.
 */
export class Regen extends PassiveAbility {

    /**
     * Healing per second.
     */
    private rate: number = 2;

    private player!: PlayerSchema;

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    init() {
        super.init();
        this.player = this.get(Player)!.schema;

    }

    update(delta: number) {
        super.update?.(delta);

        if (isAlive(this.player.state)) {
            const hp = this.player.hp + this.rate * delta;
            this.player.hp = hp > this.player.maxHp ? this.player.maxHp : hp;
        }


    }

}