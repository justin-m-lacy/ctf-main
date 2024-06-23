import System from '../../engine/system';
import { CtfSchema, CtfState } from '@/model/schema/ctf-schema';
import { CtfMatch } from '../ctf-match';
import { InternalEvent } from '../data/consts';
import { NO_TIMER } from '../../model/schema/ctf-schema';

/// seconds to wait after game end.
const END_WAIT: number = 25;

const START_COUNTDOWN: number = 1;

/**
 * Allow players to move but don't count points until enough players join.
 */
export class WaitGroup extends System<CtfMatch> {

    private state?: CtfSchema;

    /**
     * Setup complete. Game will start after countdown.
     * TODO: just add another Ctf game state?
     */
    private starting: boolean = false;

    onAdded() {
        super.onAdded();
        this.state = this.game!.state;
        this.beginWait();

    }
    onRemoved() {
        super.onRemoved();
        this.state = undefined;
    }

    public beginWait() {
        this.starting = false;
        if (this.state?.state === CtfState.init) {
            this.state.state = CtfState.setup;
        } else if (this.state?.state === CtfState.ended) {
            this.state.stateTimer = END_WAIT
        }
        this.start();
    }

    update(delta: number) {

        const state = this.state!;
        const curState = state.state;
        if (curState === CtfState.ended) {

            /// Countdown to restart game, enter waiting mode.
            state.stateTimer -= delta;
            if (state.stateTimer <= 0) {

                /// enters wait mode.
                this.waitRestart();

            }

        } else if (curState === CtfState.setup) {

            if (!this.starting) {

                const players = state.players;
                if (players.size >= state.params.minPlayers) {
                    this.starting = true;
                    state.stateTimer = START_COUNTDOWN;
                }

            } else {
                state.stateTimer -= delta;
                if (state.stateTimer <= 0) {
                    this.startMatch();
                }
            }

        } else {
            this.stop();
        }

    }

    /// reenter waiting after match ended.
    private waitRestart() {
        this.starting = false;
        this.state!.state = CtfState.setup;
        this.state!.stateTimer = NO_TIMER;
    }

    private startMatch() {

        this.stop();
        this.state!.stateTimer = NO_TIMER;
        this.state!.state = CtfState.active;
        this.game!.emit(InternalEvent.MatchStart);
        this.game!.removeGroup(this);

    }

}