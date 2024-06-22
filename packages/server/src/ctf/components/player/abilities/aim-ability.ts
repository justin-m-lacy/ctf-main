import { AbilitySchema, AbilityState } from '../../../../model/schema/data/ability-schema';
import { TPoint } from '../../../../engine/data/geom';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { FireTarget } from '../fire-target';
import { TriggerAbility } from './trigger-ability';


/**
 * Aiming ability requires a fire target point.
 */
export abstract class AimAbility extends TriggerAbility {

    /**
     * Maximum distance at which the ability can fire.
     */
    public maxDist: number | null = null;

    /**
     * Maximum angle offset from player at which the ability can fire.
     */
    public maxAngle: number | null = null;

    public canFire(): boolean { return true; }

    public abstract onFire(player: PlayerSchema, angle: number, dist: number): void;

    /**
     * Set in subclass to indicate ability will be ended manually.
     */
    protected manualEnd: boolean = false;

    private fireTarget!: FireTarget;

    constructor(schema: AbilitySchema, params?: any) {

        super(schema, params);
        schema.type = 'aim';

    }

    init() {
        super.init();
        this.fireTarget = this.get(FireTarget)!;

    }
    override start(at: TPoint): void {

        this._schema.state = AbilityState.active;
        this.onStart?.(at);
        this.fireTarget.setFireDest(at, this);

    }

    public fire(player: PlayerSchema, angle: number, dist: number) {

        if (this._schema.state === AbilityState.active) {
            this.onFire(player, angle, dist);
        }
        if (this.manualEnd === false) {
            this.end();
        }

        //console.log(`after fire() state: ${AbilityState[this.schema.state]}`);
        /// countdown cooldown.

    }

}