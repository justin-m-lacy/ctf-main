
export const BASE_SPEED: number = 220;

export const BASE_HP: number = 100;

/**
 * Flags about player condition.
 */
/*export enum PlayerFlags {

    none = 0,

    // player taking damage.
    damaged = 1,

  
    //player being healed.

    healed = 2,


    //player firing, unused.
    firing = 4,


}*/

export enum PlayerState {

    alive = 1,
    movable = 2 + PlayerState.alive,

    /**
     * Busy using an ability?
     */
    busy = 4 + PlayerState.alive,
    firing = 8 + PlayerState.alive,

    frozen = 16 + PlayerState.alive,

    /// Could be used for game effects the stun/stop player,
    /// although setting player.maxSpeed to 0 should work too.
    disabled = 32,

    dead = 128 + PlayerState.disabled,

}

export const isAlive = (state: PlayerState) => {
    return (state & PlayerState.alive) > 0;
}

export enum ShotType {
    basic = 1,
    thrown = 2,
    snipe = 3,
    homing = 4,

    /// spawns an object at destination.
    spawner = 5,

    /// spawns portal at dest.
    porter = 6

}

export enum ShotEffect {

    none = 0,
    /// shot causes damage and nothing else.
    hit = 1,

    blast = 2,
    // spawn portal.
    portal = 3,
    // spawn wall.
    wall = 4
}

/**
 * Todo: combine MatterCategories and body types?
 * Note: MatterCategory requires bit flag. Limit 32.
 */
export enum BodyType {

    none = 0,
    bullet = 1,
    blast = 2,
    wall = 3,

    /**
     * Damages target team when hit.
     */
    damager = 4,

    portal = 5,
    trapBlast = 6,
    blocker = 7,
    trap = 8,
    hook = 9,
    flamecone = 10,
    flameburst = 11

}