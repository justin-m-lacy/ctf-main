import { AbilitySchema, AbilityState } from '../../../../model/schema/data/ability-schema';
import { MatterPlayer } from '../../hits/matter-player';
import { TriggerAbility } from './trigger-ability';
import { HitCategory } from '../../../../model/matter';
import { Player } from '../player';
import { PlayerState, isAlive } from '../../../../model/schema/types';
import { TPoint } from '../../../../engine/data/geom';
import { PlayerSchema } from '../../../../model/schema/player-schema';


/**
 * Player becomes invincible but loses ability to act while giving
 * a minor boost to regeneration.
 */
export class Hibernate extends TriggerAbility {

    /**
    * Healing per second.
    */
    private rate: number = 0.5;

    private player!: PlayerSchema;

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    init() {
        super.init();
        this.player = this.require(Player).schema;
    }

    onStart() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask &= ~(HitCategory.Damager | HitCategory.Bullet);
        }
        const player = this.get(Player);
        player?.switchState(PlayerState.busy);

    }

    onEnd() {
        const hit = this.get(MatterPlayer);
        if (hit) {
            hit.hitMask |= (HitCategory.Damager | HitCategory.Bullet);
        }

        const player = this.get(Player);
        if (player?.state === PlayerState.busy) {
            player.switchState(PlayerState.movable);
        }

    }


    update(delta: number) {
        super.update?.(delta);

        if (isAlive(this.player.state)) {
            const hp = this.player.hp + this.rate * delta;
            this.player.hp = hp > this.player.maxHp ? this.player.maxHp : hp;
        }


    }

    onPrimary(schema: PlayerSchema, at: TPoint) {

        if (this.schema.state === AbilityState.active) {
            this.end();
        }
    }

}