
import { Body, Pair } from 'matter-js';
import { Component, Game } from 'gibbon.js';
import { DisplayObject } from 'pixi.js';


export class BodyHit<T extends object = any, D extends DisplayObject = DisplayObject, G extends Game = Game> extends Component<D, G> {

    /// Don't interact with players from this team.
    public ignoreTeam?: string;

    /// Only interact with players from this team.
    public onlyTeam?: string = undefined;

    getMatterBody() { return this.body; }

    get hitMask() { return this.body.collisionFilter.mask; }
    set hitMask(v) { this.body.collisionFilter.mask = v; }

    /**
     * Hit events handled by this component.
     */
    //protected eventMask: number;

    public readonly body: Body;

    public readonly data?: T;

    priority = 0;

    constructor(body: Body, data?: T, ignoreTeam?: string) {
        super();
        this.body = body;

        this.data = data;
        this.ignoreTeam = ignoreTeam;

        //this.eventMask = body.collisionFilter.mask ?? 0

    }

    init() {
        Body.setPosition(this.body, this.position);
    }

    /// body updated to local position to interpolate visuals.
    update() {
        Body.setPosition(this.body, this.position);
    }

    /**
     * Override in subclass.
     * @param pair 
     * @param other 
     */
    collide?(pair: Pair, other: Body, hit?: BodyHit): void;

    endCollide?(pair: Pair, other: Body, hit?: BodyHit): void;


}