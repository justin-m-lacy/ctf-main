import { PlayerSchema } from '../../model/schema/player-schema';
import { Schema } from '@colyseus/schema';
import { TAbilityDef, TAbilityDesc } from './ability';
import { DriverSchema } from '../../model/schema/data/driver-schema';

export type TCraft = {

    id: string,

    /**
     * Not worth the trouble of splitting these into separate
     * details files now.
     */
    name?: string,
    desc?: string,

    color: string,
    offColor?: string;

    /**
     * Primary fire ability.
     */
    primary?: string;

    /**
     * Stat overwrites of PlayerSchema.
     */
    stats?: Partial<Omit<PlayerSchema & DriverSchema, keyof Schema>>,

    abilities: (string | {id:string}&Partial<TAbilityDesc>)[]

}

/**
 * Base craft data with ability id strings replaced by
 * full ability information.
 */
export type TCraftFull = Omit<TCraft, 'abilities'> & {

    abilities: TAbilityDesc[]
};



export type TCraftDetails = Omit<TCraft, 'abilities'> & {

    name: string,
    desc: string,

    abilities: TAbilityDesc[]

}