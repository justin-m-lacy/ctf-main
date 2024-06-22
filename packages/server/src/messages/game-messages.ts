import type { TPoint } from '../engine/data/geom';
import type { BodyType } from '../model/schema/types';

export type TeamScored = {
    who: string;
    /**
     * team gaining points.
     */
    team: string;
    /**
     * team scored against.
     */
    flag_team?: string;
    score: number
}

export type PlayerDied = {
    who: string;
    at: TPoint;
    by?: string;
    /// Team flag dropped, if any.
    flag?: string
}

export type PlayerHit = {

    who: string;
    hp: number;
    by?: string;
    /**
     * Object type that did the damage.
     */
    bodyType?: BodyType;
}

export type Reposition = {
    who: string,
    pos: TPoint,
    angle?: number
}


export type FlagDropped = {
    by: string;
    at: TPoint;
    flag_team: string;
}

export type FlagReturned = {
    by: string;
    at: TPoint;
    team_flag: string;
}

export type PlayerDest = {

    who: string;
    to: TPoint;
}

export type PlayerChargeFire = {
    who: string;
}

export type PlayerCancelFire = {
    who: string;
}