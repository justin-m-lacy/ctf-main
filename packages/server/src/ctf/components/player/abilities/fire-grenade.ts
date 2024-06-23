import { PlayerSchema } from '@/model/schema/player-schema';
import { ShotEffect, ShotType } from '@/model/schema/types';
import { AimAbility } from './aim-ability';


export class Grenade extends AimAbility {

    public onFire(schema: PlayerSchema, angle: number, dist: number): void {
        this.game!.bullets.spawnBullet(schema, angle, dist, ShotType.thrown, ShotEffect.blast)
    }


}