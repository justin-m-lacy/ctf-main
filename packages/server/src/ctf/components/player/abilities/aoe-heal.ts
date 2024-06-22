import { TriggerAbility } from './trigger-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';

export class AoeHeal extends TriggerAbility {

    private rate: number = 15;

    private r2: number = 0;

    private player!: PlayerSchema;

    /**
     * Whether enemies are also healed.
     */
    private enemies: boolean = false;

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
        const maxD = this.r2;

        for (const schema of this.game!.state.players.values()) {

            if (!this.enemies && schema.team !== this.player.team) {
                continue;
            }

            const dx = schema.pos.x - pos.x;
            const dy = schema.pos.y - pos.y;

            if (dx * dx + dy * dy <= maxD) {

                schema.hp += amt;

                if (schema.hp > schema.maxHp) {
                    schema.hp = schema.maxHp;
                }

            }


        }

        super.update(delta);
    }


}