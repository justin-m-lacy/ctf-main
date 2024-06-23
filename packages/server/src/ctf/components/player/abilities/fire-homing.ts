import { PlayerSchema } from '@/model/schema/player-schema';
import { AimAbility } from './aim-ability';


/**
 * Fire a homing missile.
 */
export class FireHoming extends AimAbility {

    public onFire(schema: PlayerSchema, angle: number, dist: number): void {

        this.game!.bullets.spawnHoming(schema, angle, dist);

    }


}