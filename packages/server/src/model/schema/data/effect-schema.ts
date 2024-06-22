import { Schema, type } from '@colyseus/schema';

/**
 * Ongoing effect on player.
 */
export class EffectSchema extends Schema {

    @type("string") id: string = ''
    @type('number') startTick: number = 0;

    /**
     * Total duration.
     */
    @type('number') duration: number = 0;

    constructor() {
        super();

    }

}