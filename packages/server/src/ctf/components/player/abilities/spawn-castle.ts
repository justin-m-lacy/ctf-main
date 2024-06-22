import { TriggerAbility } from './trigger-ability';
import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { Bodies } from 'matter-js';
import { TPoint } from '../../../../engine/data/geom';
import Actor from '../../../../engine/actor';
import { BodySchema } from 'src/model/schema/body-schema';
import { PlayerSchema } from '../../../../model/schema/player-schema';
import { Player } from '../player';
import { MatterBody } from '../../hits/matter-body';
import { Priorities } from '../../../data/consts';

import { BodyShape, HitCategory, WallProperties } from '../../../../model/matter';
import { BodyType } from '../../../../model/schema/types';
import { TimeDestroy } from '../../../../engine/components/timed-destroy';

/**
 * Spawn a series of blockers that orbit player.
 */
export class SpawnCastle extends TriggerAbility {

    private wallThickness = 50;
    private wallLength = 400;

    private player!: PlayerSchema;

    priority = Priorities.PostPlayer;

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {

        this.player = this.actor!.get(Player)!.schema;
        super.init();

    }

    onStart() {

        const pos = this.position;

        this.spawnBody({ x: pos.x, y: pos.y - this.wallLength / 2 }, Math.PI / 2);
        this.spawnBody({ x: pos.x, y: pos.y + this.wallLength / 2 }, -Math.PI / 2);
        this.spawnBody({ x: pos.x + this.wallLength / 2, y: pos.y }, 0);
        this.spawnBody({ x: pos.x - this.wallLength / 2, y: pos.y }, Math.PI);

        this.end();
    }

    private spawnBody(pos: TPoint, rotation: number) {

        const a = new Actor(pos);

        const mb = new MatterBody(
            Bodies.rectangle(pos.x, pos.y, this.wallThickness, this.wallLength, {

                angle: rotation,
                ...WallProperties
            }
            ),
            new BodySchema(
                {
                    id: a.id.toString(),
                    type: BodyType.wall,
                    shape: BodyShape.rect,
                    angle: rotation,
                    hitMask: WallProperties.collisionFilter?.mask,
                    player: this.player.id,
                    team: this.player.team,
                    extents: { x: this.wallThickness / 2, y: this.wallLength / 2 },
                    time: this.schema.duration
                }
            ),

        );

        /// allow this team to pass through.
        mb.ignoreTeam = this.player.team;
        mb.ignoreTeamObjects = this.player.team;

        a.addInstance(mb, MatterBody);
        a.addInstance(new TimeDestroy(this.schema.duration));

        (this.actor?.group ?? this.game).addActor(a);

    }

}