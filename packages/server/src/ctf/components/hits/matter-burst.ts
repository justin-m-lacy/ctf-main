import { Bodies, Pair, Body } from 'matter-js';
import { BlastSchema } from '../../../model/schema/blast-schema';
import { PlayerSchema } from '../../../model/schema/player-schema';
import { MatterData } from './matter-data';
import { InternalEvent } from '../../data/consts';
import { DamageBody } from '../../../model/matter';
import { BodyType } from '../../../model/schema/types';
import { MatterBody } from './matter-body';

/**
 * Differs from Blast in that only the leading edge of
 * the ring causes damage.
 */
export class MatterBurst extends MatterBody<BlastSchema> {

    get radius() { return this.data.extents.x }
    set radius(v: number) {

        const scale = v / this.data.extents.x;
        Body.scale(this.body, scale, scale);
        this.data.extents.x = v;

    }

    /**
     * Damage
     */
    private width: number;

    constructor(schema: BlastSchema, width: number) {
        super(Bodies.circle(0, 0, schema.extents.x, DamageBody), schema);

        this.ignoreTeam = schema.team;
        this.ignoreTeamObjects = schema.team;

        this.width = width;
    }

    collide(pair: Pair, other?: MatterData) {

        if (!other) {
            return;
        }
        if (this.ignoreTeamObjects != null && (other.ignoreTeamObjects === this.data.team)) {
            return;
        }
        if (other.onlyTeamObjects && (this.data.team !== other.onlyTeamObjects)) { return; }

        if (other.data instanceof PlayerSchema) {

            if (other.data.team === this.ignoreTeam) return;
            if (this.onlyTeam && other.data.team !== this.onlyTeam) return;
            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;

            const minR = this.radius - this.width - other.data.radius;
            const maxR = this.radius + other.data.radius;

            const d = dx * dx + dy * dy;
            if (d < minR * minR || d > maxR * maxR) {
                //console.log(`Out of Burst Bounds: ${Math.sqrt(d)}`);
                return;
            }

            /// single collision only?
            this.game.emit(InternalEvent.PlayerHit, other.data, this.data.power,
                BodyType.blast, this.data.player
            );

            //const factor = 1 - d / (r * r);

        }


    }

    override activeCollide(pair: Pair, other?: MatterData): void {

        /// collision ongoing.
        //console.log(`ongoing collision...`);

    }

    override update(delta: number) {

        this.data.cTime += delta;

        if (this.data.cTime > this.data.time) {
            this.actor?.destroy();
        } else {
            const t = this.data.cTime / this.data.time;

            this.radius = (1 - t) * this.data.startRadius + t * this.data.endRadius;

            this.data.pos.setTo(this.position);
            Body.setPosition(this.body, this.position);
        }
    }

}