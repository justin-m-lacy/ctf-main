import { Flag } from '@components/flag';
import { Group } from 'gibbon.js';
import { FlagSchema } from '../../../server/src/model/schema/flag-schema';
import { ActorBuilder } from '../builders/actor-builder';
import { IActiveMatch } from '../model/iactive-match';
import { ClientGame } from '../client-game';
import { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { MatchEvent } from '../model/match-events';
import { PlayersGroup } from './players-group';
import { CarriedFlag } from '../components/carried-flag';

/**
 * Manages team and flag states.
 */
export class FlagGroup extends Group<ClientGame> {

    /**
     * Flags stored by TeamId, since it's easier and more useful.
     */
    readonly flags: Map<string, Flag> = new Map();
    private builder?: ActorBuilder;

    private match?: IActiveMatch;

    private playerGroup?: PlayersGroup;

    constructor(match: IActiveMatch, builder: ActorBuilder) {

        super();
        this.match = match;
        this.builder = builder;

    }

    onAdded() {

        this.playerGroup = this.game!.getGroup(PlayersGroup);
        this.match!.once(MatchEvent.InitialState, this.onInitState, this);


    }

    private onInitState(state: CtfSchema) {

        this.match!.on(MatchEvent.FlagState, this.onFlagState, this);
        this.match!.on(MatchEvent.FlagCarrier, this.onFlagCarrier, this);

        for (const team of state.teams.values()) {

            const schema = team.flag;
            const flag = this.builder!.makeFlag(team.flag, team.color, this);

            this.flags.set(team.id, flag);

            this.onFlagState(team);

            if (schema.carrier !== '' && schema.carrier) {
                this.onFlagCarrier(team, schema.carrier);
            }

        }
        this.match!.on(MatchEvent.FlagMoved, this.onFlagMoved, this);

    }

    /**
     * Flag state changed.
     * @param schema 
     */
    private onFlagState(team: TeamSchema) {

        const f = this.flags.get(team.id);
        if (f) {
            f.setState(team.flag.state, team.flag.pos);
        } else {
            console.warn(`Missing team flag: ${team.id}`);
        }

    }

    /**
     * Flag's carrier changed.
     * @param id 
     * @param state 
     */
    private onFlagCarrier(team: TeamSchema, newPlayer?: string) {

        const flag = this.flags.get(team.id);
        if (!flag) {
            console.warn(`FlagGroup.onFlagCarrier(): Missing flag: ${team.id}`);
            return;
        }

        if (newPlayer) {
            const player = this.playerGroup?.getPlayer(newPlayer);
            if (player?.actor && !player.actor.isDestroyed) {

                const carry = flag.require(CarriedFlag);
                carry.setCarry(player.actor,
                    player.actor.clip!.width / 2,
                    player.actor.clip!.height / 2);

            } else {
                console.warn(`flag carrier not found: ${newPlayer}`);
            }
            //player?.carryFlag(team.id, team.color);
        } else {
            const carry = flag.get(CarriedFlag);
            if (carry) {
                carry.enabled = false;
            }
        }

    }

    private onFlagMoved(schema: FlagSchema) {

        const f = this.flags.get(schema.team);
        if (f) {
            f.updatePos(schema.pos);
        } else {
            console.log(`flag ${schema.team} Component missing.`);
        }
    }

    onDestroy() {

        if (this.match) {
            this.match.off(MatchEvent.FlagMoved, this.onFlagMoved, this);
            this.match.off(MatchEvent.InitialState, this.onInitState, this);
            this.match.off(MatchEvent.FlagState, this.onFlagState, this);
        }

        this.builder = undefined;
        this.match = undefined;
    }

}