import { IActiveMatch } from './iactive-match';

export enum LocalEvent {
    /**
     * Local player actor was spawned.
     * (actor)
     */
    PlayerSpawned = 'playerSpawned',

    /**
     * Player requests to leave match.
     */
    LeaveMatch = 'leaveMatch'

}

/**
 * Events taking place at root app level.
 */
export enum AppEvent {

    SendChat = 'sendChat',
    ConnectClicked = 'connectClicked',
    JoinedLobby = 'joinedLobby',
    JoinLobbyFailed = 'joinedLobbyFailed',
    JoiningMatch = 'joiningMatch',
    JoinFailed = 'joinFailed',
    MatchJoined = 'matchJoined',
    /// match assets loaded and ready.
    MatchReady = 'matchReady',
    MatchLeft = 'matchLeft',
    LeftLobby = 'leftLobby',
    LobbyError = 'lobbyError',
    TryLogin = 'trylogin',
}

/**
 * Client Events outside of an active match.
 * Lobby/Join Games/Games listed, etc.
 */
export interface AppEvents {

    [AppEvent.SendChat]: (text: string, to?: string) => void,

    [AppEvent.JoinLobbyFailed]: (err: any) => void,

    /**
     * local player joined lobby.
     */
    [AppEvent.JoinedLobby]: () => void,
    [AppEvent.LobbyError]: (err: any) => void,
    [AppEvent.LeftLobby]: () => void,
    [AppEvent.ConnectClicked]: () => void,

    /**
     * Local player began joining ctf match.
     */
    [AppEvent.JoiningMatch]: () => void,
    [AppEvent.JoinFailed]: (err: any) => void,

    /**
     * local player joined match.
     */
    [AppEvent.MatchJoined]: (match: IActiveMatch) => void,

    [AppEvent.MatchReady]: (match: IActiveMatch) => void,

    /**
     * Player did leave match.
     */
    [AppEvent.MatchLeft]: () => void,

    [AppEvent.TryLogin]: () => void

}