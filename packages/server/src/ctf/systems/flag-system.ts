import { Component } from '../../engine/component';
import { Flag } from '../components/flag';
import { PlayerSchema } from '../../model/schema/player-schema';
import { FlagSchema, FlagState } from '../../model/schema/flag-schema';
import { CtfSchema, CtfState } from 'src/model/schema/ctf-schema';
import type { CtfMatch } from '../ctf-match';
import { InternalEvent } from '../data/consts';
import { isAlive } from '../../model/schema/types';

/**
 * Check flag hits; handle flag spawning and movement.
*/
export class FlagSystem extends Component<CtfMatch> {

    /// named ctfFlags since component has flags.
    private readonly ctfFlags: Map<string, Flag> = new Map();

    private state: CtfSchema;

    constructor(state: CtfSchema, flags: Map<string, Flag>) {

        super();

        this.state = state;
        this.ctfFlags = flags;

    }

    init() {
        this.game.on(InternalEvent.FlagHit, this.onFlagHit, this);
        this.game.on(InternalEvent.MatchStart, this.reset, this);
    }

    private reset() {

        for (const f of this.ctfFlags.values()) {
            f.restore();
        }

    }

    update() {

        const players = this.state.players;

        let dx: number, dy: number;
        let x: number, y: number;

        const teams = this.state.teams;
        for (const t of teams.values()) {

            const flag = t.flag;

            if (flag.state === FlagState.carried || flag.state === FlagState.spawning) {
                /// Flag not hittable.
                continue;
            } else if (flag.state === FlagState.returned) {
                flag.carrier = undefined;
                flag.state = FlagState.base;
            }

            x = flag.pos.x;
            y = flag.pos.y;

            /// TODO: Replace with MaterialFlag. Flag actor allows player/flag abilities
            /// like protective orb/etc.
            for (const p of players.values()) {

                if (isAlive(p.state)) {
                    dx = p.pos.x - x;
                    dy = p.pos.y - y;

                    if (dx * dx + dy * dy < (p.radius + 0.5 * flag.size) * (p.radius + 0.5 * flag.size)) {
                        this.game.emit(InternalEvent.FlagHit, p, flag);
                        break;
                    }
                }


            }


        }

    }

    private onFlagHit(p: PlayerSchema, f: FlagSchema) {

        const flag = this.ctfFlags.get(f.team);

        if (!flag) {
            console.warn(`onFlagHit(): missing flag: ${f.team}`);
            return;
        }


        if (p.team === f.team) {

            /// Player hit own team's flag.
            if (f.state === FlagState.dropped) {

                console.log(`Flag Saved.`);
                /// Player saved own flag.
                flag.saved(p.id);

            } else if (f.state === FlagState.base) {

                /// Player touched own base. Look for flag held by player.
                for (const otherFlag of this.ctfFlags.values()) {

                    if (otherFlag.carrier === p.id) {
                        this.teamScored(p, otherFlag);
                        break;
                    }

                }

            }

        } else {

            /// Opponent hit flag.
            if (
                (f.state === FlagState.dropped || f.state === FlagState.base)) {

                for (const otherFlag of this.ctfFlags.values()) {
                    if (otherFlag.carrier === p.id) {
                        /// Already carrying flag.
                        console.log(`Player already carrying flag. Skipping flag carry.`);
                        return;
                    }
                }
                console.log(`Flag carried: ${p.id}`);
                f.state = FlagState.carried;
                f.carrier = p.id;

            }

        }

    }

    private teamScored(player: PlayerSchema, flag: Flag) {

        flag.restore();

        if (this.state.state === CtfState.active) {
            const team = this.state.teams.get(player.team)!;
            if (team) {
                team.score++;
                this.game!.emit(InternalEvent.TeamScored, team, player);
                if (team.score >= this.state.params.winPoints) {
                    this.game!.emit(InternalEvent.TeamWon, team, player.id);
                }
            } else {
                console.warn(`FlagSystem.teamScored(): no player team: ${player.team}`);
            }
        }

    }

    onDestroy() {
        this.game?.off(InternalEvent.MatchStart, this.reset, this);
        this.game?.off(InternalEvent.FlagHit, this.onFlagHit, this);
    }

}