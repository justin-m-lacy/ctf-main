import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { PlayerState } from '../../../../server/src/model/schema/types';
import { PlayerLerp } from '../motion/player-lerp';

export class LocalPlayer extends Player {

    public get isLocalPlayer() { return true; }

    //private driver!: Driver;
    //private mover!: ForwardMover;

    constructor(schema: PlayerSchema, color?: number) {
        super(schema, color);
    }

    protected initFSM() {

        super.initFSM();

        const state = this.fsm.getState(PlayerState.dead)!;
        state.addEnterDisable(PlayerLerp);
        state.addExitEffect({
            enable: [PlayerLerp]
        });

    }

}