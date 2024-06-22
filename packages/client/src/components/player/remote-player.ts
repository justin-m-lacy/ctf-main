import { Player } from './player';
import { PlayerState } from '../../../../server/src/model/schema/types';
import { PlayerLerp } from '../motion/player-lerp';

export class RemotePlayer extends Player {

    protected initFSM() {

        super.initFSM();

        const state = this.fsm.getState(PlayerState.dead)!;
        state.addEnterDisable(PlayerLerp);
        state.addExitEffect({
            enable: [PlayerLerp]
        });

    }

}