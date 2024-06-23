import { Pair, Bodies } from 'matter-js';

import { SchemaMover } from '../../../engine/components/schema-mover';
import { MatterData } from './matter-data';
import { PlayerSchema } from '@/model/schema/player-schema';
import { HitCategory } from '../../../model/matter';
import { ActorEvent } from '../../data/consts';


export class MatterPlayer extends MatterData<PlayerSchema> {

    get hitMask() {
        return this.data.hitMask;
    }
    set hitMask(v) {
        this.data.hitMask = this.body.collisionFilter.mask = v;
    }

    private mover!: SchemaMover;

    constructor(schema: PlayerSchema) {
        super(
            Bodies.circle(0, 0, schema.radius, {

                /// adding type:'player' here breaks all hits for unknown reason.
                isSensor: true,
                collisionFilter: {
                    category: HitCategory.Player,
                    mask: schema.hitMask
                }
            }), schema

        );

    }

    init() {
        super.init();
        this.mover = this.get(SchemaMover)!;
        /// Only handle wall hits.
        this.eventMask = HitCategory.Wall | HitCategory.Water;

    }

    collide(pair: Pair, other?: MatterData) {

        if (other) {

            if (other.ignoreTeam === this.data.team) return;
            if (other.onlyTeam && (this.data.team !== other.onlyTeam)) return;
        }

        const pos = this.position;
        const depth = pair.collision.penetration;
        const force = 0.05;

        /// direction of restitution.
        const factor = pair.bodyA === this.body ? 1 : -1;

        pos.set(
            pos.x + factor * depth.x - force * this.mover.speed * this.mover.direction.x,
            pos.y + factor * depth.y - force * this.mover.speed * this.mover.direction.y
        );

        this.mover.accel = 0;
        this.mover.speed = 0;

        this.data.pos.set(pos.x, pos.y);

        this.actor?.emit(ActorEvent.PlayerCollide, pair.bodyA === this.body ? pair.bodyB : pair.bodyA, other);

    }

}