import { TriggerAbility } from './trigger-ability';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { Bodies } from 'matter-js';
import { RadPerDeg, } from '../../../../engine/data/geom';
import Actor from '../../../../engine/actor';
import { BodySchema } from '@/model/schema/body-schema';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { MatterBody } from '../../hits/matter-body';
import { Priorities } from '../../../data/consts';
import { FixedLerp } from '../../fixed-lerp';
import { Follow } from '../../follow';
import { HitCategory } from '../../../../model/matter';
import { BodyType } from '../../../../model/schema/types';

/**
 * Spawn a series of blockers that orbit player.
 */
export class SpawnBlockers extends TriggerAbility {

    private maxBodies: number = 5;

    private angle: number = 0;
    private omega: number = 90 * RadPerDeg;

    /// distance between each object.
    private deltaAngle: number;

    private blockerDist: number = 150;
    private blockerRadius: number = 24;

    private readonly bodies: FixedLerp[] = [];

    private spawnTimer: number = 0;
    private spawnWait: number;


    private player!: PlayerSchema;

    priority = Priorities.PostPlayer;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);

        this.deltaAngle = 2 * Math.PI / this.maxBodies;

        this.spawnWait = 0.5;

    }

    init() {
        this.player = this.actor!.get(Player)!.schema;
        super.init();
    }

    onStart() {

        if (this.bodies.length > 0) {
            this.clearBodies();
        }
        this.spawnBody();

    }

    update(delta: number) {

        super.update(delta);

        if (this.bodies.length < this.maxBodies) {

            this.spawnTimer += delta;
            if (this.spawnTimer >= this.spawnWait) {
                this.spawnBody();
            }
        }

        this.angle += this.omega * delta;
        let subAngle = this.angle;

        let f: FixedLerp;

        for (let i = this.bodies.length - 1; i >= 0; i--) {

            f = this.bodies[i];

            if (!f.isDestroyed) {

                f.target.x = this.blockerDist * Math.cos(subAngle);
                f.target.y = this.blockerDist * Math.sin(subAngle);

            }
            subAngle += this.deltaAngle;

        }

    }

    private spawnBody() {

        this.spawnTimer = 0;
        const a = new Actor(this.position);

        const mb = new MatterBody(
            Bodies.circle(this.position.x, this.position.y, this.blockerRadius, {
                isSensor: true,
                collisionFilter: {
                    category: HitCategory.Blocker,
                    mask: HitCategory.Bullet
                }
            }),
            new BodySchema(
                {
                    type: BodyType.blocker,
                    id: a.id.toString(),
                    radius: this.blockerRadius,
                    hitMask: HitCategory.Bullet,
                    player: this.player.id,
                    team: this.player.team
                }
            ),

        );
        a.addInstance(mb, MatterBody);
        const lerp = new FixedLerp(300);
        const offset = new Follow(this.position, lerp.value);

        const f = a.addInstance(lerp);
        a.addInstance(offset);
        this.bodies.push(f);

        (this.actor?.group ?? this.game).addActor(a);

    }

    onEnd() { this.clearBodies(); }

    clearBodies() {
        for (let i = this.bodies.length - 1; i >= 0; i--) {

            const body = this.bodies[i];
            if (!body.actor?.isDestroyed) {
                body.actor?.destroy();
            }

        }
        this.bodies.length = 0;
    }

    onDestroy() { this.clearBodies(); }

}