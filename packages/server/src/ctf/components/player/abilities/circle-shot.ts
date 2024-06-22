import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from 'src/model/schema/player-schema';


/**
 * Aimining ability is an ability that requires a fire target.
 */
export class CircleShot extends AimAbility {

    private count: number = 8;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    /**
     * 
     */
    public override onFire(schema: PlayerSchema, angle: number, dist: number) {

        const dt = 2 * Math.PI / this.count;
        for (let theta = 2 * Math.PI; theta > 0; theta -= dt) {
            this.game.bullets.spawnBullet(schema, theta, dist);

        }

    }

}