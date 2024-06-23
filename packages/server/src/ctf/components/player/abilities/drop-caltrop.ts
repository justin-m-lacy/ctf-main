import { TriggerAbility } from './trigger-ability';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import Actor from '../../../../engine/actor';
import { Bodies, Pair } from 'matter-js';
import { BodySchema } from '@/model/schema/body-schema';
import { Player } from '../player';
import { MatterData } from '../../hits/matter-data';
import { MatterPlayer } from '../../hits/matter-player';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { MatterBody } from '../../hits/matter-body';
import { InternalEvent } from '../../../data/consts';
import { BodyType } from '../../../../model/schema/types';
import { HitCategory } from '../../../../model/matter';
import { CaltropSlow } from '../../efffects/caltrop-slow';
import { TPoint } from '../../../../engine/data/geom';
import { MoveSpeed } from '../move-speed';
import { TimeDestroy } from '../../../../engine/components/timed-destroy';

export class DropCaltrops extends TriggerAbility {

    private player?: PlayerSchema;

    constructor(ability: AbilitySchema, params: any) {
        super(ability, params);
    }

    init() {

        super.init();
        this.player = this.get(Player)?.schema;

    }

    onStart() {

        const delta = 55 * Math.PI / 180;
        let angle = (Math.PI + this.rotation) - delta;

        const pos = this.position;

        for (let i = 0; i < 3; i++) {

            this.spawnCaltrop(pos, Math.cos(angle), Math.sin(angle));
            angle += delta;

        }

        if (this.duration <= 0) {
            this.end();
        }


    }

    private spawnCaltrop(at: TPoint, cos: number, sin: number) {

        const a = new Actor(at);

        const schema = new BodySchema({
            type: BodyType.damager,
            hp: 20,
            id: `${a.id}`,
            player: this.player?.id,
            team: this.player?.team,
            hitMask: HitCategory.Player | HitCategory.Damager,
            extents: { x: 10, y: 10 }

        });

        a.addInstance(
            new MatterBody(
                Bodies.circle(at.x, at.y, schema.extents.x, {

                    isSensor: true,
                    collisionFilter: {
                        category: HitCategory.Hittable
                    }

                }), schema, (p, t, o) => this.onHit(p, t, o))
        );

        a.addInstance(new TimeDestroy(7));
        a.addInstance(new MoveSpeed(200 * cos, 200 * sin)).setVTarget(0, 0);

        this.game!.addActor(a);
    }

    private onHit(pair: Pair, trap: MatterBody, other?: MatterData) {

        if (other instanceof MatterPlayer) {

            if (other.data.team !== this.player?.team) {

                this.game!.emit(InternalEvent.PlayerHit, other.data, 30, BodyType.damager, this.player?.id);
                other.require(CaltropSlow).start(4);

            }

        }

    }

    onEnd() {
    }

}