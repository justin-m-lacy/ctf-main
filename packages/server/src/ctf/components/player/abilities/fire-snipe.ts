import { PlayerSchema } from 'src/model/schema/player-schema';
import { Player } from '../player';
import { PlayerState, ShotEffect, ShotType } from '../../../../model/schema/types';
import { TPoint } from '../../../../engine/data/geom';
import { TriggerAbility } from './trigger-ability';

export class Snipe extends TriggerAbility {

    onStart() {

        this.get(Player)?.switchState(PlayerState.busy);
    }

    onEnd() {
        const player = this.get(Player);
        if (player?.state === PlayerState.busy) {
            player.switchState(PlayerState.movable);
        }
    }

    public onPrimary(schema: PlayerSchema, at: TPoint): void {

        const dx = at.x - schema.pos.x;
        const dy = at.y - schema.pos.y;

        this.game!.bullets.spawnBullet(schema, Math.atan2(dy, dx), Math.sqrt(dx * dx + dy * dy), ShotType.snipe, ShotEffect.hit);
        this.end();
    }

}