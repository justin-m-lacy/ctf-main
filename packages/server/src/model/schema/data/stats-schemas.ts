import { Schema, type } from '@colyseus/schema';

export class PlayerStats extends Schema {

    @type("number") kills: number = 0;
    @type("number") deaths: number = 0;

    @type("number") flagsTaken: number = 0;
    @type("number") flagsDropped: number = 0;
    @type("number") flagsSaved: number = 0;

    @type("number") flagsCapped: number = 0;

    reset() {

        this.kills = this.deaths = this.flagsTaken = this.flagsDropped = this.flagsSaved = this.flagsCapped = 0;


    }

}