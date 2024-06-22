import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { RadPerDeg } from '../../../../engine/data/geom';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from 'src/model/schema/player-schema';


/**
 * Aimining ability is an ability that requires a fire target.
 */
export class TripleShot extends AimAbility {

    private offAngle: number = RadPerDeg * 30;

    /**
     * 
     */
    public override onFire(schema: PlayerSchema, angle: number, dist: number) {

        this.game.bullets.spawnBullet(schema, angle - this.offAngle, dist);
        this.game.bullets.spawnBullet(schema, angle, dist);
        this.game.bullets.spawnBullet(schema, angle + this.offAngle, dist);

    }

}