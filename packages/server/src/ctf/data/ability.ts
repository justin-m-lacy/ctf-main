export type TAbilityType = 'passive' | 'trigger' | 'aim';

/**
 * Targeting options for an ability.
 */
export type TAbilityTarget = 'none' | 'point' | 'enemy' | 'ally';

/**
 * An ability that a player can use.
 */
export type TAbilityDef = {

    id: string,

    /**
     * Cooldown in seconds.
     */
    cooldown?: number

    /**
     * Duration of ability in seconds.
     */
    duration?: number;

    target?: TAbilityTarget;

    /**
     * Passive ability is always on.
     * Trigger ability triggers without target.
     * aim abilities have firing target location.
     */
    type?: TAbilityType;

    /**
     * power of any spawned bullets.
     */
    power?: number;

    /**
     * Minimum distance from aim target.
     */
    minDist?: number,
    /**
     * Maximum distance to aim ability.
     */
    maxDist?: number,

    /**
     * Maximum difference in angle from firing player.
     */
    maxAngle?: number,

    /**
     * Radius of ability effect.
     */
    radius?: number,

    /**
     * Parameters passed to component.
     */
    params?: {
        [key: string]: number
    }
    /**
     * Component to add to craft's actor.
     * Question of whether to allow data files to define these.
     */
    //component?: string,

    /**
     * Keep or not? Component to add when ability used.
     * Could just be handled by core component?
     */
    //use?: string,

}


export type TAbilityDesc = TAbilityDef & {
    name?: string,

    desc?: string,

}
/*export type TAimAbility = TAbilityDef & {

    minFireDist?: number,
    maxFireDist?: number,

    //maxFireAngle?: number

}*/