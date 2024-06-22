import { Schema, type } from '@colyseus/schema';
import { GeomData, MapData } from '../../../ctf/data/parser';
import { BASE_HP } from '../types';

/**
 * Variables to describe fundamental match values.
 */
export class MatchParams extends Schema {

    @type("string") map: string = '';

    @type("number") arenaWidth: number = 0;
    @type("number") arenaHeight: number = 0;

    @type('number') minFireDist: number = 120;
    @type('number') maxFireDist: number = 540;

    /**
     * Maximum angle difference a player can fire at
     * in modes that allow free aim.
     */
    @type('number') maxFireAngle: number = 8 * Math.PI / 180;


    /**
     * Number of captures for a team to win.
     */
    @type("int8") winPoints = 3;

    @type('uint8') baseHp: number = BASE_HP;

    /**
     * Refill rate of mana percent per second.
     */
    @type('number') manaFillRate: number = 0.13;

    /**
 * Time it takes to fire, in seconds.
 */
    @type("number") fireTime: number = 0.5;


    /**
     * Time in seconds to reach max charge.
     */
    @type("number") maxCharge: number = 1;

    /**
     * Minimum time in seconds to hold a charge before firing.
     */
    @type("number") minCharge: number = 0.1;


    /**
     * Percent mana cost to fire.
     */
    @type('number') fireCost = 0.5;

    /**
     * Minimum number of players for match to start.
     */
    @type('uint8') minPlayers: number = 1;

    /**
     * Maximum number of players in match.
     */
    @type('uint8') maxPlayers: number = 10;

    /**
     * Length of time explosion lasts.
     */
    //@type("uint32") blastTimeMs = 200;

    @type("int8") maxTeams = 2;

    /**
     * Respawn time of dead player in seconds.
     */
    @type("uint32") respawnTime = 5;

    constructor(data: Partial<MatchParams>) {
        super();

        Object.assign(this, data);
    }

}