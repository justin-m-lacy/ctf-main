export enum Priorities {


    Driver = 4000,
    Mover = 5000,
    FSM = 7000,
    MoverBounds = 8000,
    /**
     * Copy out positions, motions, to schema.
     */
    Player = 10000,
    PostPlayer = 10500,
    MatterJs = 11000,


}

export enum ActorEvent {
    PlayerCollide = 'playerCollide'
}

export enum InternalEvent {


    PlayerHit = 'playerHit',
    PlayerLeft = 'playerLeft',

    /**
     * Player spawned event. (player:Player):void
     */
    PlayerSpawned = 'playerSpawn',
    FlagHit = 'flagHit',
    TeamScored = 'teamScored',
    TeamWon = 'teamWon',

    CraftChanged = 'craftChanged',

    /**
     * Switch match from waiting mode to start mode.
     */
    MatchStart = 'matchStart'


}