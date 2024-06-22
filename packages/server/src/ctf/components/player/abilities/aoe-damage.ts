import { TriggerAbility } from './trigger-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { InternalEvent } from '../../../data/consts';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { BodyType } from '../../../../model/schema/types';

export class AoeDamage extends TriggerAbility {

    /**
     * aoe damage rate.
     */
    private rate: number = 12;

    private r2: number = 0;

    private player!: PlayerSchema;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);

        const r = schema.data?.radius ?? 0;
        this.r2 = r * r;

    }

    init() {

        super.init();
        this.player = this.get(Player)!.schema;

    }

    update(delta: number) {

        const amt = this.rate * delta;

        const pos = this.position;

        const maxDist = this.r2;
        for (const schema of this.game!.state.players.values()) {

            if (schema.team === this.player.team) {
                continue;
            }

            const dx = schema.pos.x - pos.x;
            const dy = schema.pos.y - pos.y;

            if (dx * dx + dy * dy <= maxDist) {

                /// TODO: Messy since sending the event on trivial damage
                /// will trigger too many player hits events.
                if (amt < schema.hp) {

                    schema.hp -= amt;

                } else {
                    this.game.emit(InternalEvent.PlayerHit, schema, amt, BodyType.none, this.player.id);
                }
            }


        }

        super.update(delta);
    }


}