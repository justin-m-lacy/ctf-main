import Group from '../../engine/group';
import { CtfMatch } from '../ctf-match';
import { EngineEvent } from '../../engine/actor';
import { PlayerSchema } from '../../model/schema/player-schema';
import { BulletSchema } from '../../model/schema/bullet-schema';
import { PointSchema } from '../../model/schema/data/point-schema';
import { angleToPt } from 'src/engine/data/geom';
import { clampToPi, Point } from '../../engine/data/geom';
import { Builder } from '../builders/builder';
import { CtfSchema } from '../../model/schema/ctf-schema';
import Actor from '../../engine/actor';
import { Bullet } from '../components/bullet';
import { BlastSystem } from './blast-system';
import bullets from '../../../assets/bullets.json';
import { ShotType, ShotEffect } from '../../model/schema/types';
import { HomingMissile } from '../components/homing-missile';

type TBulletDef = {

    radius?: number,
    power?: number,
    speed?: number,
    blast?: number,
    time?: number

}

type TBulletData = {
    [key: string]: TBulletDef
}

export class BulletGroup extends Group<CtfMatch> {

    private readonly builder: Builder;
    private state: CtfSchema;

    private blastSystem!: BlastSystem;

    getBulletDef = (str: ShotType) => {
        return (bullets as TBulletData)[ShotType[str]];
    }

    constructor(ctf: CtfMatch, builder: Builder, blast: BlastSystem) {

        super();

        this.state = ctf.state;
        this.builder = builder;
        this.blastSystem = blast;

    }

    /**
     * 
     * @param player 
     * @param moveTime  - length of time bullet will move.
     */
    public spawnBullet(player: PlayerSchema, angle: number, dist: number, type: ShotType = ShotType.basic, effect: ShotEffect = ShotEffect.blast) {

        const schema = this.makeSchema(type, effect, player, dist, angle);

        const comp = this.builder.makeBullet(schema);

        this.state.bullets.set(schema.id, schema);
        /// Send bullet changes to clients.
        //this.state.bullets.triggerAll();

        comp.actor!.on(EngineEvent.ActorDestroyed, this.onDestroy, this);

        return comp;

    }

    public spawnHoming(player: PlayerSchema, angle: number, dist: number) {

        const bullet = this.spawnBullet(player, angle, dist, ShotType.homing, ShotEffect.hit);
        bullet.actor!.addInstance(new HomingMissile(bullet.schema, player.team));

    }

    private makeSchema = (type: ShotType, effect: ShotEffect, player: PlayerSchema, dist: number, angle: number) => {

        const data = this.getBulletDef(type) ?? this.getBulletDef(ShotType.basic);

        const playerPos = player.pos;

        return new BulletSchema({
            type: type,
            effect: effect,
            player: player.id,
            team: player.team,
            radius: data.radius ?? 5,
            speed: data.speed,
            power: data.power ?? 0,
            blast: data.blast,
            time: data.time ?? dist / data.speed!,
            dest: new PointSchema(angleToPt(player.pos, clampToPi(angle), dist)),
            angle: angle,
            pos: new Point(playerPos.x + player.radius * Math.cos(angle), playerPos.y + player.radius * Math.cos(angle))
        });

    }

    private onDestroy(obj: Actor) {

        const bullet = obj.get(Bullet);
        if (bullet) {

            const schema = bullet.schema;
            this.state.bullets.delete(schema.id);

            if (schema.effect === ShotEffect.blast) {
                this.blastSystem.spawnBlast(
                    obj.position,
                    schema.radius,
                    schema.blast,
                    schema.player
                );
            } else if (schema.effect === ShotEffect.portal) {

                this.blastSystem.spawnPortal(obj.position, schema.blast, schema.team, undefined, schema.player);

            } else if (schema.effect === ShotEffect.wall) {

                /// spawn wall at location.

            }
        }

    } // onDestroy()

}