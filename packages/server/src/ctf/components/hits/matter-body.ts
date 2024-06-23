import { Body, Pair, Bodies } from 'matter-js';

import { Priorities } from '../../data/consts';
import { MatterData } from './matter-data';
import { BodySchema } from '@/model/schema/body-schema';
import { BulletSchema } from '../../../model/schema/bullet-schema';
import { BlastSchema } from '../../../model/schema/blast-schema';
import { MatterPlayer } from './matter-player';

/**
 * Continuously sets Schema position and Body position to Actor position.
 */
export class MatterBody<T extends BodySchema = BodySchema> extends MatterData<T> {

    getBody() { return this.body; }

    get hitMask() { return this.data.hitMask; }
    set hitMask(v) { this.data.hitMask = this.body.collisionFilter.mask = v; }

    public get onHit() { return this._onHit }
    public set onHit(v) { this._onHit = v }

    private _onHit?: (pair: Pair, body: MatterBody, other?: MatterData) => void;

    public set scale(s: number) {
        super.scale = s;

        this.data.extents.set(
            0.5 * (this.body.bounds.max.x - this.body.bounds.min.x),
            0.5 * (this.body.bounds.max.y - this.body.bounds.min.y)
        );
    }


    priority = Priorities.MatterJs;

    /**
     * Hit mask is copied from schema.hitMask
     * @param body 
     * @param schema 
     */
    constructor(body: Body, schema: T, onHit?: (pair: Pair, body: MatterBody, other?: MatterData) => void) {
        super(body, schema);

        if (schema.hitMask) {
            body.collisionFilter.mask = schema.hitMask;
        } else if (body.collisionFilter.mask) {
            schema.hitMask = body.collisionFilter.mask;
        }

        this.ignoreTeamObjects = schema.team;
        this._onHit = onHit;

    }
    init() {
        if (!this.data.id || this.data.id === '') {
            console.warn(`missing data id: ${this.data.id}`);
        }
        this.game.state.bodies.set(this.data.id, this.data);
        Body.setPosition(this.body, this.position);

        if (this.body.angle) {
            this.rotation = this.body.angle;
        }
        this.data.pos.setTo(this.position);

    }

    update(delta: number) {
        this.data.pos.setTo(this.position);
        Body.setPosition(this.body, this.position);
    }
    /**
     * Default implementation calls onHit() hooks and allows this body
     * to be damaged by Blast Bullets.
     * Override in subclass.
     * @param pair 
     * @param other 
     */
    collide(pair: Pair, other?: MatterData) {


        if (other instanceof MatterPlayer) {

            if (this.ignoreTeam === other.data.team) return;
            if (this.onlyTeam && this.onlyTeam !== other.data.team) return;

            this._onHit?.(pair, this, other);

        } else if (this.data.destructible) {

            if (other?.data instanceof BulletSchema || other?.data instanceof BlastSchema) {

                if (other.data.team === this.ignoreTeamObjects) return;
                if (this.onlyTeamObjects && (other.data.team !== this.onlyTeamObjects)) return;

                this._onHit?.(pair, this, other);

                this.data.hp -= other.data.power;
                other.actor?.destroy();
                if (this.data.hp <= 0) {
                    this.actor?.destroy();
                }

            }
        }


    }

    onDestroy() {
        this.game.state.bodies.delete(this.data.id);
        this._onHit = undefined;
        super.onDestroy?.();

    }

}