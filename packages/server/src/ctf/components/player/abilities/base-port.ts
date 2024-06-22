import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { Player } from '../player';
import { TriggerAbility } from './trigger-ability';
import { SchemaMover } from '../../../../engine/components/schema-mover';
import { Driver } from '../driver';
import { isAlive } from '../../../../model/schema/types';


/**
 * Port back to own flag's spawn.
 */
export class PortToBase extends TriggerAbility {

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    onStart() {

        const mover = this.get(SchemaMover)!;
        mover.forceStop();

        const driver = this.get(Driver)!;
        driver.halt();
        driver.enabled = false;


    }

    onEnd() {

        const player = this.get(Player)!;
        if (isAlive(player.state)) {

            /// Portal to base.
            const team = this.game!.getTeam(player.schema.team);
            if (team) {
                this.game.reposition(player, team.flag.spawn);
            }

        }


    }

}