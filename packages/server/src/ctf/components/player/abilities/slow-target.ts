import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from 'src/model/schema/player-schema';
import { SpeedAdjust } from '../speed-adjust';
import { SlowEffect } from '../../efffects/slow';


export class SlowTarget extends AimAbility {

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    /**
     * Slow enemy at target location.
     */
    public override onFire(schema: PlayerSchema, angle: number, dist: number) {

        const enemy = this.game.matterSystem.getEnemyAt({
            x: schema.pos.x + dist * Math.cos(angle),
            y: schema.pos.y + dist * Math.sin(angle)
        }, schema.team);

        if (enemy) {
            console.log(`Slowing enemy: ${enemy.id}`);
            enemy.actor?.require(SlowEffect).start(this.schema.duration);
        } else {
            console.log(`No enemy target found.`);
        }

    }

}