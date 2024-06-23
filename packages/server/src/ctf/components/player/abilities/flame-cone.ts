import { TriggerAbility } from './trigger-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { BodyType, PlayerState } from '../../../../model/schema/types';
import { TPoint } from '../../../../engine/data/geom';
import { FlameConeHit } from '../../hits/flame-cone-hit';
import { BlastSchema } from '@/model/schema/blast-schema';
import Actor from '../../../../engine/actor';
import { BodyShape } from '@/model/matter';
export class FlameCone extends TriggerAbility {

    /**
     * aoe damage rate.
     */
    private rate: number = 40;

    private pSchema!: PlayerSchema;


    private player?: Player;

    /**
     * length (along X axis) of flame triangle.
     */
    private length: number = 220;

    /**
     * base (y-axis) of flame triangle.
     */
    private base: number = 280;

    /**
     * Current flame cone.
     */
    private flameHit?: FlameConeHit;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {

        super.init();
        this.player = this.get(Player)!;
        this.pSchema = this.player.schema;

    }

    //override start for 'at' point. fix this?
    public override start(at?: TPoint) {

        super.start(at);

        if (!this.flameHit) this.flameHit = this.makeFlame();

        this.player?.switchState(PlayerState.busy);

        this.onStart?.();

    }

    end() {

        if (this.player?.state === PlayerState.busy) {
            this.player.switchState(PlayerState.movable);
        }
        this.flameHit?.actor?.destroy();
        this.flameHit = undefined;

        super.end();

    }

    private makeFlame() {
        const cos = Math.cos(this.pSchema.angle), sin = Math.sin(this.pSchema.angle);
        const pos = { x: this.pSchema.pos.x + this.pSchema.radius * cos, y: this.pSchema.pos.y + this.pSchema.radius * sin };

        const a = new Actor(pos);

        const fire = new BlastSchema({
            id: a.id.toString(),
            type: BodyType.flamecone,
            power: this.rate,
            shape: BodyShape.polygon,
            player: this.pSchema.id

        }, pos);

        fire.extents.x = 0.5 * this.length;
        fire.extents.y = 0.5 * this.base;


        const hit = new FlameConeHit(
            fire,
            this.pSchema.team);

        a.addInstance(hit);
        this.game.addActor(a);

        return hit;
    }

    update(delta: number) {

        if (this.flameHit) {

            const angle = this.flameHit.rotation = this.pSchema.angle;

            this.flameHit.position.set(
                this.pSchema.pos.x + this.pSchema.radius * Math.cos(angle),
                this.pSchema.pos.y + this.pSchema.radius * Math.sin(angle)
            );

        }

        super.update(delta);
    }

    onDestroy() {
        super.onDestroy();

        this.player = undefined;
    }
}