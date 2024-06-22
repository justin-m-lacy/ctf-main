import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { Component } from 'gibbon.js';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';


/**
 * Any component that controls the client display of an ability.
 * Currently initialized when ability is activated.
 * Might change to allow abilities to have controlled while inactive?
 * Could change ui etc.
 */
export interface IAbilityControl extends Component {

    /**
     * Called when ability is made active.
     * Possibly add more callbacks for ability added but inactive.
     * @param ability 
     * @param data 
     * @param localParams - Additional client-side parameters.
     */
    startAbility(ability: AbilitySchema, data?: TAbilityDef, params?: { [key: string]: number }): void;
    endAbility(): void;

}