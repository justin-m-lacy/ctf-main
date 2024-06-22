import { TriggerAbility } from './trigger-ability';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { BodyType } from '../../../../model/schema/types';
import { TPoint } from '../../../../engine/data/geom';
import { BlastSchema } from 'src/model/schema/blast-schema';
import Actor from '../../../../engine/actor';
import { BodyShape } from 'src/model/matter';
import { MatterBurst } from '../../hits/matter-burst';

/**
 * Circular burst of flame outwards.
 */
export class FlameBurst extends TriggerAbility {

    /**
     * aoe damage rate.
     */
    private rate: number = 50;

    private player!: PlayerSchema;

    /// size of wave front.
    private burstWidth: number = 20;

    /**
     * length (along X axis) of flame triangle.
     */
    private maxRadius: number = 300;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {

        super.init();
        this.player = this.get(Player)!.schema;

    }

    public override onStart(at?: TPoint) {
        this.makeFlame();
    }

    private makeFlame() {
        const cos = Math.cos(this.player.angle), sin = Math.sin(this.player.angle);
        const pos = { x: this.player.pos.x + this.player.radius * cos, y: this.player.pos.y + this.player.radius * sin };

        const a = new Actor(pos);
        const fire = new BlastSchema({
            id: a.id.toString(),
            type: BodyType.flameburst,
            power: this.rate,
            time: this.duration,
            shape: BodyShape.circle,
            player: this.player.id,
            team: this.player.team,
            startRadius: this.player.radius + 2,
            endRadius: this.maxRadius,

        }, pos);



        const hit = new MatterBurst(
            fire,
            this.burstWidth);

        a.addInstance(hit);
        this.game.addActor(a);

        return hit;
    }

}