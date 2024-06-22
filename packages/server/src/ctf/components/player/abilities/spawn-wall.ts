import { PlayerSchema } from 'src/model/schema/player-schema';
import { AimAbility } from './aim-ability';
import Actor from '../../../../engine/actor';
import { MatterBody } from '../../hits/matter-body';
import { Bodies } from 'matter-js';
import { BodySchema } from 'src/model/schema/body-schema';
import { TimeDestroy } from '../../../../engine/components/timed-destroy';
import { BodyShape, WallProperties } from '../../../../model/matter';
import { BodyType, ShotType, ShotEffect } from '../../../../model/schema/types';
import { EngineEvent } from '../../../../engine/actor';
import { TPoint } from '../../../../engine/data/geom';


/**
 * For a short time wall appears at target location.
 */
export class SpawnWall extends AimAbility {

    /**
     * Note: Wall angle of 0 corresponds to x being long.
     */
    private wallSizeX: number = 200;
    private wallSizeY: number = 40;

    public onFire(player: PlayerSchema, angle: number, dist: number): void {

        const bullet = this.game.bullets.spawnBullet(player, angle, dist, ShotType.spawner, ShotEffect.wall);

        bullet.actor?.on(EngineEvent.ActorDestroyed, (a: Actor) => {

            this.spawnWall(player, a.position, angle);

        });


    }

    private spawnWall(player: PlayerSchema, pos: TPoint, angle: number) {

        const actor = new Actor(pos);
        const destAngle = angle + (Math.PI / 2);

        const body = Bodies.rectangle(
            pos.x, pos.y,
            this.wallSizeX,
            this.wallSizeY,
            {
                angle: destAngle,
                ...WallProperties
            }
        );

        const mb = new MatterBody(
            body,

            new BodySchema(
                {
                    id: actor.id.toString(),
                    shape: BodyShape.rect,
                    type: BodyType.wall,
                    angle: destAngle,
                    hitMask: WallProperties.collisionFilter?.mask,
                    player: player.id,
                    team: player.team,
                    extents: { x: this.wallSizeX / 2, y: this.wallSizeY / 2 }
                }
            ),

        );

        actor.addInstance(mb, MatterBody);
        actor.addInstance(new TimeDestroy(10));

        (this.actor?.group ?? this.game).addActor(actor);
    }
}