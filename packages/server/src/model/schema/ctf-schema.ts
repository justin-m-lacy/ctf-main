import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerSchema } from './player-schema';
import { BulletSchema } from './bullet-schema';
import { MatchParams } from './data/match-params';
import { TeamSchema } from './team-schema';
import { BodySchema } from './body-schema';


/***
 * https://docs.colyseus.io/colyseus/state/schema/#filtering-data-per-client
 * NOTE: Filtering.`
 * 
 * On the example below, considering we're making a card game, we are filtering the cards to be available only for the owner of the cards, or if the card has been flagged as "revealed".

import { Schema, type, filter } from "@colyseus/schema";
import { TeamSchema } from './team-schema';

export class State extends Schema {
  @filterChildren(function(client: any, key: string, value: Card, root: State) {
      return (value.ownerId === client.sessionId) || value.revealed;
  })
  @type({ map: Card })
  cards = new MapSchema<Card>();
}
 */

const TeamColors: number[] = [

    0xaa0000,
    0x0000aa,
    0x00aa00

];

export enum CtfState {

    /**
     * Basic Game/Room init. Over almost instantly.
     */
    init = 0,

    /**
     * Setup game and wait players.
     */
    setup,
    active,

    /**
     * Game over, will restart shortly.
     */
    ended

}

export const NO_TIMER = -1;
export class CtfSchema extends Schema {

    @type('number') patchRate: number = 50;

    @type(MatchParams) params: MatchParams;

    @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();

    @type({ map: BulletSchema }) bullets = new MapSchema<BulletSchema>();

    @type({ map: TeamSchema }) teams = new MapSchema<TeamSchema>();

    @type({ map: BodySchema }) bodies = new MapSchema<BodySchema>();

    /**
     * Time in seconds when CtfState will change.
     * Used to indicate impending switches from ending/waiting to
     * active state.
     */
    @type('number') stateTimer: number = NO_TIMER;

    @type('uint8') state: CtfState = CtfState.init;


    constructor(params: MatchParams) {

        super();

        this.params = params;
    }

    /**
     * Return player's team id or null.
     * @param playerId 
     * @returns 
     */
    getPlayerTeam(playerId: string | PlayerSchema) {

        const p = typeof playerId === 'string' ? this.players.get(playerId) : playerId;
        if (p) {
            return this.teams.get(p.team);
        } else {
            console.warn(`unexpected teamless player: ${playerId}`);
        }
        return null;


    }

    assignTeamColors() {

        let i = 0;
        for (let t of this.teams.values()) {

            if (t.color === 0) {
                t.color = TeamColors[i++]
            }

        }

    }

    /**
     * Removes player if it exists
     * and removes player from team.
     * @param id 
     * @param removeTeam - set to false to preserve team
     * in case player rejoins.
     */
    removePlayer(id: string, removeTeam = true) {

        const p = this.players.get(id);
        if (p) {

            if (removeTeam && p.team) {

                const team = this.teams.get(p.team);
                if (team) {
                    team.removePlayer(p);
                }
            }
            this.players.delete(id);

        }

    }

    getPlayer(id: string) {
        return this.players.get(id);
    }

    randTeam() {
        const len = this.teams.size;
        if (len <= 0) {
            return null;
        }
        let ind = Math.floor(Math.random() * len);
        for (const teamId of this.teams.keys()) {
            if (ind-- <= 0) {
                return teamId;
            }
        }
        return null;
    }

    /**
     * Randomly return a team with minimal player count.
     * (There could be more than one.)
     * @returns 
     */
    randSmallestTeam() {

        const len = this.teams.size;
        if (len <= 0) {
            return null;
        }

        const teamVals = Array.from(this.teams.values());

        let teamIndex = Math.floor(Math.random() * len);
        let minSize: number = teamVals[teamIndex].size;
        const startIndex = teamIndex;

        let i = startIndex + 1;
        while (i != startIndex) {

            if (i >= len) {
                i = 0;
                continue;
            }
            if (teamVals[i].size < minSize) {
                teamIndex = i;
                minSize = teamVals[i].size;
            }
            i++;

        }
        return teamVals[teamIndex];

    }

}