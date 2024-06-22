import { Bodies, Pair, Body } from 'matter-js';
import { BlastSchema } from '../../../../src/model/schema/blast-schema';
import { PlayerSchema } from '../../../../src/model/schema/player-schema';
import { MatterData } from './matter-data';
import { InternalEvent } from '../../data/consts';
import { DamageBody } from '../../../model/matter';
import { BodyType } from '../../../model/schema/types';

export class MatterBlast extends MatterData<BlastSchema> {

    get radius() { return this.data.extents.x }
    set radius(v: number) {

        const scale = v / this.data.extents.x;
        Body.scale(this.body, scale, scale);
        this.data.extents.x = v;

    }

    constructor(schema: BlastSchema) {
        super(Bodies.circle(0, 0, schema.extents.x, DamageBody), schema);
    }

    init() {

        Body.setPosition(this.body, this.position);
        this.data.pos.setTo(this.position);
        this.game.state.bodies.set(this.data.id, this.data);

    }

    collide(pair: Pair, other?: MatterData) {

        if (other) {
            if (other.ignoreTeamObjects != null && other.ignoreTeamObjects === this.data.team) {
                return;
            }
            if (other.onlyTeamObjects && (this.data.team !== other.onlyTeamObjects)) { return; }

            if (other.data instanceof PlayerSchema) {

                const dx = other.position.x - this.position.x;
                const dy = other.position.y - this.position.y;

                const r = this.data.endRadius + other.data.radius;
                const factor = 1 - (dx * dx + dy * dy) / (r * r);
                if (factor > 0) {
                    this.game.emit(InternalEvent.PlayerHit, other.data, this.data.power * factor,
                        BodyType.blast, this.data.player
                    );
                }

            }
        }

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

    onDestroy() {

        this.game?.state.bodies.delete(this.data.id);
        super.onDestroy?.();
    }


}