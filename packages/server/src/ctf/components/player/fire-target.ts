import { Component } from '../../../engine/component';
import { Point, TPoint, clampToPi } from '../../../engine/data/geom';
import { Player } from './player';
import { PlayerState } from 'src/model/schema/types';
import { MatchParams } from '../../../model/schema/data/match-params';
import { CtfMatch } from 'src/ctf/ctf-match';
import { FSM, StateEvent } from '../../../engine/components/fsm';
import { State } from 'src/engine/data/state';
import { Driver } from './driver';
import { AimAbility } from './abilities/aim-ability';
import { radToDeg } from 'src/utils/logging';


/**
 * Track a firing target until the angle/distance is aligned
 * close enough to actually fire.
 */
export class FireTarget extends Component<CtfMatch> {

    private minDist2: number = 0;
    private maxDist2: number = 0;
    private maxAngle: number = 0;

    readonly target: Point = new Point();

    private player!: Player;
    private driver!: Driver;
    private fsm!: FSM;

    /**
     * Type of fire/action to take when in fire range.
     */
    private fireAbility: AimAbility | null = null;

    private params: MatchParams;

    /**
     * Whether player is allowed to attempt to fire.
     * Does not determine whether a player can actually fire ( is in range, has mana, etc.)
     * Firetarget is auto-disabled on these conditions, but is not enabled unless there is
     * an active fire target.
     */
    public allowFire() { return this.player.state !== PlayerState.frozen }

    /**
     * Whether player allowed to fire can actually fire at this instant.
     */
    public canFire() {
        return this.fireAbility?.canFire();
    }

    constructor(params: MatchParams) {

        super();

        this.params = params;

    }

    init() {
        this.player = this.get(Player)!;
        this.driver = this.get(Driver)!;

        const fsm = this.fsm = this.require(FSM);
        fsm.addStateDisable(PlayerState.dead, this);
        fsm.addStateDisable(PlayerState.disabled, this);

        this.actor!.on(StateEvent.enter, this.onEnterState, this);

    }

    onDisable() {

        /// Any fire in progress is lost.
        if (this.fireAbility) {
            this.fireAbility?.end();
            this.fireAbility = null;
        }
    }

    /**
     * TODO: remove this somehow.
     * move player group?
     * @param to
     * @returns true if dest was set, false if state not allowed.
     */
    public setMoveDest(to: TPoint) {

        this.fireAbility = null;

        if (this.player.state === PlayerState.movable || this.player.state === PlayerState.firing) {
            this.driver.enabled = true;
            this.driver.setDest(to);
            // this.player.schema.triggerAll();

        }
    }

    private onEnterState(state: State<PlayerState>) {

        if (state.name === PlayerState.movable) {
            /// player can click new fire target while firing.
            if (this.enabled && this.fireAbility) {
                this.setFireDest(this.target, this.fireAbility);

            }
        }

    }

    public setFireDest(at: TPoint, ability: AimAbility) {

        if (this.allowFire()) {

            /// Nav to firing distance.
            this.driver.setDest(at);

            /// set firing distances.
            const schema = ability.schema;
            this.maxAngle = schema.maxAngle ?? this.params.maxFireAngle;
            this.maxDist2 = schema.maxDist ?? this.params.maxFireDist;
            this.minDist2 = schema.minDist ?? this.params.minFireDist;
            this.maxDist2 *= this.maxDist2;
            this.minDist2 *= this.minDist2;

            this.fireAbility = ability;

            if (!this.tryFire(at)) {
                this.target.set(at.x, at.y);
                this.enabled = true;
            }

        } else {
            this.enabled = false;
        }

    }

    /**
     * Attempt to fire at location. Return true if fire succeeds.
     * @param at 
     * @returns true if player was able to fire.
     */
    private tryFire(at: TPoint) {

        if (this.player.state === PlayerState.firing) {
            /// Already firing, but can set target for next fire.
            return false;
        }

        const schema = this.player.schema;

        const dx = at.x - schema.pos.x
        const dy = at.y - schema.pos.y;

        let d2 = dx * dx + dy * dy;

        if (d2 <= this.maxDist2) {

            const angle: number = Math.atan2(dy, dx);
            const deltaAngle: number = clampToPi(schema.angle - angle);

            if (Math.abs(deltaAngle) <= this.maxAngle && this.canFire()) {

                if (d2 < this.minDist2) {
                    d2 = this.minDist2
                }


                this.driver.halt();
                this.fsm.switchState(PlayerState.firing);

                if (this.fireAbility) {
                    this.fireAbility?.fire(schema, angle, Math.sqrt(d2));
                    this.fireAbility = null;
                    //this.player.schema.triggerAll();
                }


                this.enabled = false;
                return true;
            } else {

                this.driver.setDest(schema.pos, angle);
                this.driver.enabled = true;
            }

        }


        return false;

    }

    update() {
        this.tryFire(this.target);
    }

}