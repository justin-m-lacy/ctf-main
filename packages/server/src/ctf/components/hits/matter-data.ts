import { Component } from '../../../engine/component';
import { Body, Pair } from 'matter-js';

import { Priorities } from '../../data/consts';
import { CtfMatch } from '../../ctf-match';

export class MatterData<T extends object = any> extends Component<CtfMatch> {

    public getBody() { return this.body; }

    public get hitMask() { return this.body.collisionFilter.mask! }
    public set hitMask(v) { this.body.collisionFilter.mask = v; }

    public get rotation() { return this.body.angle }
    public set rotation(v: number) {
        super.rotation = v;
        Body.setAngle(this.body, v);
    }

    public set scale(dest: number) {

        /// Each scaling of the body works on the current body size.
        /// NOTE: Matter.js doesn't seem to have any concept of a 'base scale'
        const cur = this._scale;
        Body.scale(this.body, dest / cur, dest / cur);
        this._scale = dest;

    }
    public get scale() { return this._scale }
    private _scale: number = 1;

    /**
     * Do not interact with players from this team.
     */
    public ignoreTeam?: string;
    /**
     * Do not interact with objects from this team.
     */
    public ignoreTeamObjects?: string;

    /**
     * Only interact with players from this team.
     */
    public onlyTeam?: string = undefined;

    /**
     * Only interact with objects from this team.
     */
    public onlyTeamObjects?: string = undefined;


    /**
     * Hit events handled by this component.
     */
    public eventMask: number;

    public readonly body: Body;
    readonly data: T;

    priority = Priorities.MatterJs


    constructor(body: Body, schema: T) {
        super();
        this.body = body;

        this.data = schema;

        this.eventMask = body.collisionFilter.mask ?? 0;

    }

    init() {
        Body.setPosition(this.body, this.position);
    }

    onEnable() {
        if (this.actor) {

            this.game.matterSystem.addMatter(this);
        }

    }

    onDisable() {
        this.game.matterSystem.removeMatter(this);
    }

    /**
     * Override in subclass.
     * @param pair 
     * @param other 
     */
    collide(pair: Pair, other?: MatterData) {

    }

    endCollide?(pair: Pair, other?: MatterData): void;

    activeCollide?(pair: Pair, other?: MatterData): void;

    update(delta: number) {
        Body.setPosition(this.body, this.position);
    }

}