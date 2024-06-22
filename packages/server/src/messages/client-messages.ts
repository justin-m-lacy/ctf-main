import { TPoint } from '../engine/data/geom';
export type ClientTrackPoint = {
    at: TPoint,

    /**
     * Ability tracking is tied to.
     */
    ability: string
}

export type ClientCraftSelect = {
    craft: string;
}

export type ClientDest = {

    to: TPoint;
}

export type ClientChargeFire = {
}

export type ClientFire = {
    to: TPoint;
}

export type ClientCancelFire = {
}

export type ClientUsePrimary = {
    at: TPoint;
}

export type ClientUseAbility = {

    id: string;

    /**
     * Ability attack location, if any.
     */
    at?: TPoint;

}