import { AbilityState } from '../../../../model/schema/data/ability-schema';
import { Ability } from './ability';
import { AbilitySchema } from '@/model/schema/data/ability-schema';
import { TPoint } from '../../../../engine/data/geom';


export abstract class TriggerAbility extends Ability {

    get lastUseTime() { return this._schema.lastUsed }
    set lastUseTime(v) { this._schema.lastUsed = v; }

    /**
     * Time in seconds that ability has been active.
     */
    public get activeTime() {
        if (this.schema.state === AbilityState.active) {
            return (this._startTime - this.game?.currentTime);
        } else return 0;

    }
    /**
     * Millisecond time when ability started.
     */
    private _startTime: number = 0;

    /**
     * Base cooldown converted to milliseconds.
     */
    public get cooldown() { return this._schema.cooldown; }

    public get duration() { return this._schema.duration; }

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
        schema.type = 'trigger';
    }


    override init() {
        super.init();

        if (this._schema.state === AbilityState.active) {
            this.start();
        } else {

            if (this._schema.state === AbilityState.cooldown) {
                this.waitCooldown();
            }

            this.enabled = false;
        }


    }

    public override start(at?: TPoint) {

        this._schema.state = AbilityState.active;
        this._startTime = this.game.currentTime;
        this.enabled = true;
        this.onStart?.();

    }

    public waitCooldown() {

        if (this._schema.cooldown > 0) {
            this._schema.lastUsed = this.game.currentTime;
            this._schema.state = AbilityState.cooldown;
            this.game.clock.setTimeout(() => {

                if (!this.isDestroyed && this._schema.state === AbilityState.cooldown) {
                    this._schema.state = AbilityState.available;
                }
            }, 1000 * this._schema.cooldown);

        } else {
            this._schema.state = AbilityState.available;
        }
    }

    public end() {

        if (this._schema.state === AbilityState.active) {
            this.onEnd?.();

            this.waitCooldown();
        }
        this.enabled = false;

    }

    /**
     * NOTE: delta has to be included here or compiler complains about subclasses using it.
     * @param delta 
     */
    public override update(delta: number) {

        if (this._schema.state === AbilityState.active) {
            /// If an ability has no duration, subclass must end it manually
            /// since it might require user input to deactivate, fire, etc.
            if (this.duration > 0) {
                if (this.game!.currentTime - this._startTime > this.duration) {
                    this.end();
                }
            }
        }

    }


}