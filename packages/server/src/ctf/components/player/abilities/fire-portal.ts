import { PlayerSchema } from '@/model/schema/player-schema';
import { ShotEffect, ShotType } from '@/model/schema/types';
import { AimAbility } from './aim-ability';

/**
 * Fire bullet that creates a portal to spawn enemies to spawn.
 */
export class FirePortal extends AimAbility {

    public onFire(player: PlayerSchema, angle: number, dist: number): void {

        this.game.bullets.spawnBullet(player, angle, dist, ShotType.porter, ShotEffect.portal);

    }

}