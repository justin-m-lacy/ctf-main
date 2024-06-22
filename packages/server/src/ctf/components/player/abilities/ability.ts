import { Component } from '../../../../engine/component';
import { CtfMatch } from '../../../ctf-match';
import { AbilitySchema, AbilityState } from '../../../../model/schema/data/ability-schema';
import { TPoint } from '../../../../engine/data/geom';
import { PlayerSchema } from '../../../../model/schema/player-schema';


export abstract class Ability extends Component<CtfMatch> {

    public get schema() { return this._schema; }

    protected _schema: AbilitySchema;

    protected onStart?(at?: TPoint): void;

    protected onEnd?(): void;

    /**
     * Override primary fire.
     */
    public onPrimary?(schema: PlayerSchema, at: TPoint): void;

    public abstract start(at?: TPoint): void;

    public end() {
        this.onEnd?.();
        this._schema.state = AbilityState.available;
    }

    public canUse() {
        return this._schema.state === AbilityState.available;
    }


    /**
     * Base cooldown converted to milliseconds.
     */
    public get cooldown() { return this._schema.cooldown; }

    public get duration() { return this._schema.duration; }


    constructor(schema: AbilitySchema, params?: any) {

        super();

        this._schema = schema;

    }

    public waitCooldown() {
        if (this._schema.type !== 'passive') {
            this._schema.state = AbilityState.available;
        }
    }

    override onDisable() {
        if (this._schema.state === AbilityState.active) {
            this.end();
        }
    }

    override onDestroy() {
        if (this._schema.state === AbilityState.active) {
            this.end();
        }
        this._schema.state = AbilityState.removed;
    }

}