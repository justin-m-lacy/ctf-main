import { PlayerDest, PlayerChargeFire, PlayerCancelFire, PlayerDied as PlayerDied, FlagDropped, FlagReturned, TeamScored, PlayerHit, Reposition } from './game-messages';
import { ClientDest, ClientCancelFire, ClientChargeFire, ClientUsePrimary, ClientUseAbility, ClientCraftSelect, ClientTrackPoint } from './client-messages';
import { ClientChat, MatchChat } from './chat-events';
import { TPoint } from '../engine/data/geom';
import { MapData } from '../ctf/data/parser';
import { CtfSchema } from '../model/schema/ctf-schema';

export enum MessageType {

    /**
     * Send mapData to server.
     */
    MapData,

    MatchEnd,

    /// Client to Server Messages.

    /**
     * Client changed destination.
     */
    ClientDest,

    ClientChargeFire,
    ClientCancelFire,

    /**
     * Client tracking point, such as targetting
     * information, that must be shared with remote clients
     * to allow them to dodge/react.
     */
    ClientTrackPoint,

    /**
     * Fire aiming at an exact point.
     */
    ClientUsePrimary,

    ClientUseAbility,

    ClientChat,

    /**
     * Client Requests character change.
     */
    ClientCharSelect,

    /**
     * Debug only. Reset ability timers.
     */
    ClientResetCooldowns,

    /// Chat Messages
    MatchChat,

    /**
     * Ping request.
     */
    Ping,

    /**
     * Ms timestamp since match start.
     */
    MatchTime,

    /**
     * Server to client messages.
     */
    PlayerDest,
    PlayerChargeFire,
    PlayerCancelFire,
    PlayerHit,
    Reposition,
    PlayerDied,
    PlayerRespawn,

    FlagDropped,
    FlagReturned,
    TeamScored,

}

/**
 * Maps MessageType to Message's content type.
 */
type MessageContents = {

    [MessageType.MapData]: {
        map: MapData,
        serverTime: number,

    },
    [MessageType.MatchEnd]: MatchEnd,

    /// Client to Server Messages.

    //Client changed destination.
    [MessageType.ClientDest]: ClientDest,
    [MessageType.ClientCancelFire]: ClientCancelFire,
    [MessageType.ClientChargeFire]: ClientChargeFire,

    [MessageType.ClientUsePrimary]: ClientUsePrimary,
    [MessageType.ClientChat]: ClientChat,
    [MessageType.ClientUseAbility]: ClientUseAbility,
    [MessageType.ClientCharSelect]: ClientCraftSelect,
    [MessageType.ClientTrackPoint]: ClientTrackPoint,

    [MessageType.ClientResetCooldowns]: {},
    [MessageType.Ping]: MatchTime,
    [MessageType.MatchTime]: MatchTime,

    [MessageType.Reposition]: Reposition,

    /// Server to client messages.
    [MessageType.PlayerHit]: PlayerHit,
    [MessageType.PlayerDest]: PlayerDest,
    [MessageType.PlayerChargeFire]: PlayerChargeFire,

    [MessageType.PlayerCancelFire]: PlayerCancelFire,
    [MessageType.PlayerDied]: PlayerDied,
    [MessageType.PlayerRespawn]: EvtPlayerRespawn,
    [MessageType.FlagDropped]: FlagDropped,
    [MessageType.FlagReturned]: FlagReturned,
    [MessageType.TeamScored]: TeamScored,

    /// Chat Messages
    [MessageType.MatchChat]: MatchChat
}

export type ContentType<T extends MessageType> = MessageContents[T];

export type MatchTime = {
    /// millisecond timestamp.
    time: number;
}

export type EvtPlayerRespawn = {
    id: string,
    angle: number;
    pos: TPoint
}

export type TeamJoin = {
    playerId: string;
    teamId: string;
}

export type TeamLeave = {
    playerId: string;
    teamId: string;
}


export type MatchEnd = {
    winner: string;
    terminated: boolean;
    scores: Map<string, number>;
}