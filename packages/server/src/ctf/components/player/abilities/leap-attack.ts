import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { TPoint, Point } from '../../../../engine/data/geom';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from '@/model/schema/player-schema';
import { Player } from '../player';
import { PlayerState } from '../../../../model/schema/types';
import { Tween } from 'tweedle.js';
import { InternalEvent, ActorEvent } from '../../../data/consts';
import { PointSchema } from '@/model/schema/data/point-schema';

export class LeapAttack extends AimAbility {

    private player!: Player;

    private readonly at: Point = new Point();

    private tween?: Tween<Player>;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);

        this.manualEnd = true;
    }

    init() {
        super.init();
        this.player = this.get(Player)!;
    }

    /**
     * Override start to prevent invalid dest? why?
     * @param at 
     */
    public onStart(at?: TPoint): void {

        if (at) {

            if (!this.schema.dest) {
                this.schema.dest = new PointSchema(at.x, at.y)
            } else {
                this.schema.dest.set(at.x, at.y)
            }
            this.at.set(at.x, at.y);

        } else {
            this.end();
        }

    }

    /**
     * 
     */
    public override onFire(schema: PlayerSchema) {

        const dx = this.at.x - schema.pos.x;
        const dy = this.at.y - schema.pos.y;

        //0.8 sec per full.
        const time = 0.35 * Math.sqrt(dx * dx + dy * dy) / (this.maxDist ?? 500);

        this.player.switchState(PlayerState.busy);

        /// Complete attack on wall collision.
        this.actor?.on(ActorEvent.PlayerCollide, this.onAttack, this);

        this.player.reposition(this.position);

        /// Note: Cannot use 'at' directly as the tween keeps the reference.
        this.tween = new Tween(this.player, this.game.tweenGroup).to({ position: this.at }, time).safetyCheck(t =>
            t.state === PlayerState.busy && !t.isDestroyed
        ).onComplete(() => {
            this.onAttack();
        }).start();

    }

    onAttack() {

        this.tween?.stop();


        this.actor?.off(ActorEvent.PlayerCollide, this.onAttack);
        this.player.reposition(this.position);

        if (this.player.state === PlayerState.busy) {

            this.player.switchState(PlayerState.movable);
            const enemy = this.game.matterSystem.getEnemyAt(this.position, this.player.teamId);
            if (enemy) {
                this.game!.emit(InternalEvent.PlayerHit, enemy, 80, null, this.player?.id);
            }


        }
        this.end();
    }

    onDestroy() {

        this.tween?.stop();
        this.tween = undefined;

    }

}