import type { BulletSchema } from "../../../server/src/model/schema/bullet-schema";
import type { BodySchema } from "../../../server/src/model/schema/body-schema";
import type { FlagSchema, FlagState } from "../../../server/src/model/schema/flag-schema";
import type { PlayerSchema } from "../../../server/src/model/schema/player-schema";
import type { IPoint } from 'gibbon.js';
import type { DriverSchema } from "../../../server/src/model/schema/data/driver-schema";
import type { MatchChat } from "../../../server/src/messages/chat-events";
import type { TeamSchema } from "../../../server/src/model/schema/team-schema";
import type { CtfSchema } from "../../../server/src/model/schema/ctf-schema";
import type { AbilitySchema } from "../../../server/src/model/schema/data/ability-schema";
import type { TPoint } from 'gibbon.js';
import type { BodyType, PlayerState } from "../../../server/src/model/schema/types";
import { GeomData, MapData } from "../../../server/src/ctf/data/parser";

/**
 * Match events are routed from events occuring on server.
 */
export enum MatchEvent {

    MatchStart = 'matchStart',
    MatchEnd = 'matchEnd',

    /**
     * data for current map.
     */
    MapData = 'mapData',

    /**
     * Match is waiting for additional players,
     * or waiting to restart after end.
     */
    MatchWaiting = 'matchWaiting',

    /**
     * Initial state from server.
     * Will only occur once per match room.
     */
    InitialState = 'initialState',
    PlayerJoin = 'playerJoin',
    PlayerLeave = 'playerLeave',
    PlayerDest = 'playerDest',
    PlayerState = 'playerState',
    PlayerMotion = 'playerMotion',

    /**
     * Force player reposition.
     */
    PlayerPos = 'playerPos',

    PlayerHit = 'playerHit',

    /**
     * Player hp changed.
     */
    PlayerHp = 'playerHp',

    /**
     * Player killed by another player.
     */
    PlayerKilled = 'playedKilled',

    /**
     * State of player hidden changed.
     */
    PlayerHidden = 'playerHide',

    /**
     * Remove player is tracking point.
     */
    TrackPoint = 'trackPoint',

    /**
     * Player changed character.
     */
    CraftChanged = 'craftChanged',

    /**
     * Player hit mask changed.
     */
    HitMask = 'hitMask',

    BodySpawned = 'spawnBody',
    BodyRemoved = 'removeBody',

    BulletSpawned = 'spawnBullet',
    BulletRemoved = 'removeBullet',

    TeamScored = 'teamScored',
    FlagSpawned = 'flagSpawned',
    FlagMoved = 'flagMoved',
    FlagState = 'flagState',
    FlagCarrier = 'flagCarrier',
    MatchError = 'matchError',
    MatchChat = 'matchChat',
    /**
     * Use ability message
     */
    AbilityState = 'onAbility'


}

/**
 * Events incoming from server.
 */
export type ServerEvents = {

    [MatchEvent.InitialState]: (state: CtfSchema, map: MapData<GeomData>) => void;
    [MatchEvent.MatchStart]: (state: CtfSchema) => void,
    [MatchEvent.MatchEnd]: (state: CtfSchema, winner: TeamSchema) => void,
    [MatchEvent.MatchWaiting]: (state: CtfSchema) => void;

    [MatchEvent.MatchChat]: (data: MatchChat) => void,

    /**
     * remote player joined match.
     * isLocal indicates the player is the local player.
     */
    [MatchEvent.PlayerJoin]: (player: PlayerSchema, isLocal: boolean) => void,
    [MatchEvent.PlayerLeave]: (player: PlayerSchema, isLocal: boolean) => void,

    [MatchEvent.PlayerDest]: (id: string, dest: IPoint, angle?: number) => void;

    [MatchEvent.PlayerState]: (schema: PlayerSchema, state: PlayerState, prevState?: PlayerState) => void;

    [MatchEvent.PlayerKilled]: (killed: PlayerSchema, by: PlayerSchema) => void;

    /**
     * Playerhit requires hp since schema not yet updated. (direct server message.)
     */
    [MatchEvent.PlayerHit]: (hit: PlayerSchema, hp: number, bodyType?: BodyType, by?: PlayerSchema) => void;

    /**
     * todo: don't use the increase param. calc ongoing hp changes locally.
     */
    [MatchEvent.PlayerHp]: (schema: PlayerSchema, hp: number, increase?: boolean) => void;

    /**
     * Player motion updated.
     */
    [MatchEvent.PlayerMotion]: (id: string, motion: DriverSchema) => void;

    /**
     * Force player reposition.
     */
    [MatchEvent.PlayerPos]: (id: string, pos: TPoint, angle?: number) => void;

    [MatchEvent.PlayerHidden]: (id: string, hidden: boolean, isLocal: boolean) => void;

    /**
     * Remote player is tracking point. Not fired for local player.
     */
    [MatchEvent.TrackPoint]: (id: string, point: TPoint, ability: string) => void;

    /**
     * Previous craft?
     */
    [MatchEvent.CraftChanged]: (schema: PlayerSchema, newCraft: string, isLocal: boolean) => void;

    [MatchEvent.HitMask]: (id: string, hitMask: number) => void;

    /**
     * Team score increased.
     */
    [MatchEvent.TeamScored]: (id: string, score: number, by: string) => void,

    /**
     * 
     */
    [MatchEvent.BulletSpawned]: (b: BulletSchema) => void,
    [MatchEvent.BulletRemoved]: (id: string) => void,

    [MatchEvent.BodySpawned]: (b: BodySchema) => void,
    [MatchEvent.BodyRemoved]: (b: BodySchema) => void,

    /// Flag Events
    [MatchEvent.FlagSpawned]: (f: FlagSchema) => void;
    [MatchEvent.FlagMoved]: (f: FlagSchema) => void;

    /**
     * team - owning team of flag.
     * playerId - player involved in change of state, if any.
     */
    [MatchEvent.FlagState]: (team: TeamSchema, prevState: FlagState, myFlag: boolean) => void;

    /**
     * Flag carrier changed.
     */
    [MatchEvent.FlagCarrier]: (team: TeamSchema, newPlayer?: string, prevPlayer?: string) => void;

    /**
     * Error occurred during match.
     */
    [MatchEvent.MatchError]: (err: any) => void,

    [MatchEvent.AbilityState]: (p: PlayerSchema, ability: AbilitySchema, isLocal: boolean) => void
}