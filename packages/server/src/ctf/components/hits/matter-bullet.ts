import { BulletSchema } from '@/model/schema/bullet-schema';
import { MatterData } from './matter-data';
import { Bodies, Pair } from 'matter-js';
import { PlayerSchema } from '../../../model/schema/player-schema';
import { InternalEvent } from '../../data/consts';
import { BulletBody, HitCategory } from '../../../model/matter';
import { BodyType } from '../../../model/schema/types';



export class MatterBullet extends MatterData<BulletSchema> {

    constructor(schema: BulletSchema) {
        super(
            Bodies.circle(0, 0, schema.radius, BulletBody), schema
        );

        /// blockers handle their own hits.
        this.eventMask &= ~HitCategory.Blocker;

    }

    collide(pair: Pair, other?: MatterData) {

        if (other) {

            if (other.ignoreTeamObjects === this.data.team) return;
            if (other.onlyTeamObjects && (this.data.team !== other.onlyTeamObjects)) return;

            if (other.data instanceof PlayerSchema) {

                if (other.data.id === this.data.player) {
                    /// Don't allow player to hit own bullet.
                    return;
                }

                this.game.emit(InternalEvent.PlayerHit,
                    other.data, this.data.power, BodyType.bullet,
                    this.data.player);

            }

        }

        this.actor?.destroy();
    }
}