import { AimAbility } from './aim-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { MatterBody } from '../../hits/matter-body';
import { BodySchema } from '@/model/schema/body-schema';
import { WallProperties, BodyShape, HitCategory } from '../../../../model/matter';
import { Bodies, Pair } from 'matter-js';
import Actor from '../../../../engine/actor';
import { TimeDestroy } from '../../../../engine/components/timed-destroy';
import { BodyType, PlayerState } from '../../../../model/schema/types';
import { MatterData } from '../../hits/matter-data';
import { Easing, Tween } from 'tweedle.js';
import { MatterPlayer } from '../../hits/matter-player';
import { DragActor } from '../../drag-object';
import { Player } from '../player';
import { StateEvent } from '../../../../engine/components/fsm';
import { State } from '@/engine/data/state';


export class FireHook extends AimAbility {

    /**
     * Actor holding the current hook actor, if any.
     */
    private curHook?: Actor;

    init() {

        super.init();
        this.actor!.on(StateEvent.enter, this.onMyState, this);
    }

    private onMyState(state: State<PlayerState>) {
        if (state.name === PlayerState.dead) {
            if (this.curHook) {
                this.endDrag(this.curHook);
            }
        }
    }

    onFire(player: PlayerSchema, angle: number, dist: number) {

        if (this.curHook) {
            this.endDrag(this.curHook);
        }

        const hookSpeed: number = 550;
        const hook = this.spawnHook(player, angle);
        const pos = player.pos;

        this.curHook = hook.actor;

        hook.onHit = (pair, body, other) => this.onHit(pair, body, other);

        const tween = new Tween(hook.actor!, this.game.tweenGroup).to(
            { x: pos.x + dist * Math.cos(angle), y: pos.y + dist * Math.sin(angle) },
            dist / hookSpeed
        ).safetyCheck(a => !a.isDestroyed)
            .yoyo(true)
            .repeat(1)
            .easing(Easing.Quartic.Out)
            .yoyoEasing(Easing.Quartic.In)
            .onComplete(a => this.endDrag(a))
            .start();




    }

    private spawnHook(player: PlayerSchema, angles: number) {

        const pos = player.pos;
        const actor = new Actor(pos);

        const radius: number = 6;

        const body = Bodies.circle(
            pos.x, pos.y,
            8,
            {
                ...WallProperties
            }
        );

        const mb = new MatterBody(
            body,

            new BodySchema(
                {
                    id: actor.id.toString(),
                    shape: BodyShape.ray,
                    type: BodyType.hook,
                    hitMask: HitCategory.Player,
                    player: player.id,
                    team: player.team,
                    extents: { x: radius, y: radius }
                }
            )

        );

        mb.ignoreTeam = player.team;

        actor.addInstance(mb, MatterBody);
        (this.actor?.group ?? this.game).addActor(actor);

        return mb;

    }

    private endDrag(hook: Actor) {

        const dragComp = hook.get(DragActor);
        if (dragComp) {

            /// Stop listening for dragged actor's state.
            dragComp.dragged.off(StateEvent.enter, this.draggerChange, this);

            const player = dragComp.dragged.get(Player);
            if (player?.state === PlayerState.busy) {
                player.switchState(PlayerState.movable);
            }

        }
        hook.destroy();
        this.curHook = undefined;

    }

    private onHit(pair: Pair, body: MatterBody, other?: MatterData) {

        if (!body.actor || !other?.actor || body.actor.isDestroyed || other.actor.isDestroyed) return;

        if (body.actor?.has(DragActor)) return;
        if (other instanceof MatterPlayer) {


            console.log(`Enemey Hit by Hook.`);

            body.hitMask = HitCategory.None;
            body.enabled = false;

            const drag = new DragActor(other.actor);
            body.actor.addInstance(drag);

            const player = other.get(Player);
            player?.switchState(PlayerState.busy);

            other.actor.on(StateEvent.enter, this.draggerChange, this);

        }

    }

    /**
     * Stop dragging target.
     */
    private draggerChange(state: State<PlayerState>, actor: Actor) {

        console.log(`Dragged changed state.`);
        actor.off(StateEvent.enter, this.draggerChange, this);
        this.curHook?.get(DragActor)?.destroy();

    }

    onDisable() {

        this.actor?.off(StateEvent.enter, this.onMyState, this);
        if (this.curHook) {
            this.endDrag(this.curHook);
        }
    }
}