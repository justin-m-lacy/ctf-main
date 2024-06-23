import { SchemaMover } from '../../../../engine/components/schema-mover';
import { AbilitySchema } from '@/model/schema/data/ability-schema';
import { TriggerAbility } from './trigger-ability';
export class Dash extends TriggerAbility {

    private bonusSpeed: number = 0;

    private mover!: SchemaMover;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {
        super.init();
        this.mover = this.require(SchemaMover);
    }
    onStart() {
        this.bonusSpeed = 3 * this.mover.baseSpeed;
        this.mover.maxSpeed += this.bonusSpeed;
    }

    onEnd() {
        this.mover.maxSpeed -= this.bonusSpeed;
    }

}