import { Component } from '../../engine/component';
import { PlayerState } from '../../model/schema/types';
import { StateEvent } from '../../engine/components/fsm';
import { State } from '@/engine/data/state';
import { Player } from './player/player';
import { CtfMatch } from '../ctf-match';

/**
 * Reposition player after respawn.
 */
export class Respawner extends Component<CtfMatch> {

    onEnable() {
        this.actor?.on(StateEvent.enter, this.onRespawn, this);
    }

    onDisable() {
        this.actor?.off(StateEvent.enter, this.onRespawn, this);
    }
    onRespawn(state: State<PlayerState>) {

        if (state.name !== PlayerState.dead) {

            const p = this.get(Player);
            if (p) {

                const team = this.game?.state.teams.get(p.schema.team);
                if (team) {
                    const at = team.getSpawnPoint();
                    this.position.set(at.x, at.y);
                    p.schema.pos.set(at.x, at.y);
                }
                p.schema.hp = p.schema.maxHp;
                this.enabled = false;

            }
        }

    }

}