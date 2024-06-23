import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { Player } from '../player';
import { TriggerAbility } from './trigger-ability';
import { SchemaMover } from '../../../../engine/components/schema-mover';
import { Driver } from '../driver';
import { PlayerState } from '@/model/schema/types';
import { FlagState } from '@/model/schema/flag-schema';


/**
 * Port to own dropped flag.
 */
export class PortToFlag extends TriggerAbility {

    private ownFlag?: boolean = false;

    constructor(schema: AbilitySchema, params: { ownFlag: boolean }) {
        super(schema);

        this.ownFlag = params.ownFlag;

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
        if (player.state === PlayerState.movable || player.state === PlayerState.firing) {

            /// Portal to base.
            const flag = this.getTargetFlag(player.teamId);
            if (flag?.state === FlagState.dropped || flag?.state === FlagState.carried) {
                this.game.reposition(player, flag.pos);

            }

        }


    }

    private getTargetFlag(myTeam: string) {

        if (this.ownFlag) {
            return this.game!.getTeam(myTeam)?.flag;
        } else {

            /// Find non-matching team.
            for (const team of this.game!.state.teams.values()) {

                if (team.id !== myTeam && team.flag.state === FlagState.dropped) {
                    return team.flag;
                }

            }


        }


    }

}