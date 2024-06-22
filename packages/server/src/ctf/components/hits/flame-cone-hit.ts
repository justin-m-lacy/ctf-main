import { Bodies, Pair, Body, Vector } from 'matter-js';

import { BlastSchema } from '../../../model/schema/blast-schema';
import { PlayerSchema } from '../../../model/schema/player-schema';
import { MatterData } from './matter-data';

import { DamageBody } from '../../../model/matter';
import { InternalEvent } from '../../data/consts';
import { MatterBody } from './matter-body';


export class FlameConeHit extends MatterBody<BlastSchema> {

    get radius() { return this.data.radius }
    set radius(v: number) {

        const scale = v / this.data.radius;
        Body.scale(this.body, scale, scale);
        this.data.radius = v;

    }

    private slope: number;

    constructor(schema: BlastSchema, ignoreTeam: string,) {

        super(
            Bodies.fromVertices(0, 0,
                [[{ x: 0, y: 0 }, { x: 2 * schema.extents.x, y: schema.extents.y }, { x: 2 * schema.extents.x, y: -schema.extents.y }]],
                DamageBody),
            schema
        );

        this.slope = schema.extents.y / (2 * schema.extents.x);

        this.ignoreTeam = ignoreTeam;

    }

    collide(pair: Pair, other?: MatterData) {

        const schema = other?.data;

        if (schema instanceof PlayerSchema && schema.team !== this.ignoreTeam) {

            const cos = Math.cos(this.data.angle), sin = Math.sin(this.data.angle);

            const dx = schema.pos.x - this.data.pos.x;
            const dy = schema.pos.y - this.data.pos.y;

            let maxY = (cos * dx + sin * dy) * (this.slope) + schema.radius;
            /// not checking hit, only intensity of damage.
            let cross = Math.abs(dy * cos - dx * sin);

            //console.log(`flame hit: ${other?.actor?.id}`);

            const amt = Math.max(1 - cross / maxY, 0) * this.data.power * this.game.deltaTime;

            if (amt < schema.hp) {
                schema.hp -= amt;

            } else {
                this.game.emit(
                    InternalEvent.PlayerHit,
                    schema,
                    amt,
                    this.data.type,
                    this.data.player);
            }


        }

    }

    override update(delta: number) {

        Body.setAngle(this.body, this.data.angle);
        Body.setPosition(this.body, this.position);

    }

}