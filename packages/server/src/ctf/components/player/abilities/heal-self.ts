import { TriggerAbility } from './trigger-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';

export class HealSelf extends TriggerAbility {

    private rate: number = 25;

    private player!: PlayerSchema;

    init() {

        super.init();
        this.player = this.get(Player)!.schema;

    }

    update(delta: number) {

        const hp = this.player.hp + this.rate * delta;
        this.player.hp = hp > this.player.maxHp ? this.player.maxHp : hp;

        super.update(delta);
    }


}