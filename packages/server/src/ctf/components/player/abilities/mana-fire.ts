import { AbilitySchema, AbilityState } from '../../../../model/schema/data/ability-schema';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from 'src/model/schema/player-schema';
import { Player } from '../player';


/**
 * Standard mana firing ability.
 */
export class ManaFire extends AimAbility {

    public override canFire() {
        return this.player.manaPct >= this.fireCost;
    }

    private player!: PlayerSchema;

    private fireCost: number = 0;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {
        super.init();

        this.fireCost = this.game.state.params.fireCost;
        this.player = this.get(Player)!.schema;

    }

    /**
     * 
     */
    public override onFire(schema: PlayerSchema, angle: number, dist: number) {
        schema.manaPct -= this.fireCost;
        this.game.bullets.spawnBullet(schema, angle, dist);
    }

}