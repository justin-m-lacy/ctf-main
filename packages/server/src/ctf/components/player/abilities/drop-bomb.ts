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

export class DropBomb extends TriggerAbility {

    private player?: PlayerSchema;

    constructor(ability: AbilitySchema, params: any) {
        super(ability, params);
    }

    init() {

        super.init();
        this.player = this.get(Player)?.schema;

    }

    onStart() {

        const a = new Actor(this.position);
        const pos = this.position;

        const schema = new BodySchema({
            type: BodyType.trap,
            hp: 20,
            id: `${a.id}`,
            player: this.player?.id,
            team: this.player?.team,
            hitMask: HitCategory.Player | HitCategory.Damager | HitCategory.Bullet,
            extents: { x: 20, y: 20 }

        });

        a.addInstance(
            new MatterBody(
                Bodies.circle(pos.x, pos.y, schema.extents.x, {

                    isSensor: true,
                    collisionFilter: {
                        category: HitCategory.Hittable
                    }

                }), schema, (p, t, o) => this.onHit(p, t, o))
        );

        this.game!.addActor(a);

        if (this.duration <= 0) {
            this.end();
        }

    }

    spawnExplode(mb: MatterBody) {

        if (this.isDestroyed) {
            return;
        }
        this.game.blasts.spawnBlast(mb.position, mb.data.extents.x,
            60, this.player?.id, BodyType.trapBlast);

        mb.actor?.destroy();


    }

    onHit(pair: Pair, trap: MatterBody, other?: MatterData) {

        if (other instanceof MatterPlayer) {

            if (other.data.team !== this.player?.team) {

                this.game!.emit(InternalEvent.PlayerHit, other.data, 30, BodyType.trap, this.player?.id);
                this.spawnExplode(trap);

            }

        } else {
            this.spawnExplode(trap);
        }

    }

    onEnd() {
    }

}