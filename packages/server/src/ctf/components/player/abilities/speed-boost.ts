import { SchemaMover } from '../../../../engine/components/schema-mover';
import { AbilitySchema } from '@/model/schema/data/ability-schema';
import { TriggerAbility } from './trigger-ability';
export class SpeedBoost extends TriggerAbility {

    private bonusSpeed: number = 0;

    private mover!: SchemaMover;

    constructor(schema: AbilitySchema) {
        super(schema);
    }

    init() {
        super.init();
        this.mover = this.get(SchemaMover)!;
    }
    onStart() {
        this.bonusSpeed = 0.3 * this.mover.baseSpeed;
        this.mover.maxSpeed += this.bonusSpeed;
    }

    onEnd() {
        this.mover.maxSpeed -= this.bonusSpeed;
    }

}