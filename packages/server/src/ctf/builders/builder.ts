import { CtfMatch } from '../ctf-match';
import { PlayerSchema } from '../../model/schema/player-schema';
import Actor from '../../engine/actor';
import { Player } from '../components/player/player';
import { BulletSchema } from '../../model/schema/bullet-schema';
import { Bullet } from '../components/bullet';

import { MatchParams } from '../../model/schema/data/match-params';
import { Rectangle, TPoint } from '../../engine/data/geom';
import { MoverBounds } from '../components/mover-bounds';
import { CtfSchema } from '../../../src/model/schema/ctf-schema';
import { FlagSchema } from '../../model/schema/flag-schema';
import { Flag } from '../components/flag';
import { MatterBullet } from '../components/hits/matter-bullet';
import { MatterPlayer } from '../components/hits/matter-player';
import { MatterData } from '../components/hits/matter-data';
import { SchemaMover } from '../../engine/components/schema-mover';

import { BoundsDestroyGroup } from '../systems/bounds-destroy';
import { HomingMissile } from '../components/homing-missile';

/**
 * Create Actor objects.
 */
export class Builder {

    private game: CtfMatch;

    /**
     * Defines basic constands for match.
     */
    private matchParams: MatchParams;

    private boundsDestroy: BoundsDestroyGroup;

    constructor(game: CtfMatch, params: MatchParams) {

        this.game = game;
        this.matchParams = params;

        this.boundsDestroy = game.addGroup(new BoundsDestroyGroup(new Rectangle(0, 0, params.arenaWidth, params.arenaHeight)));
    }

    public makeFlags(state: CtfSchema, map: Map<string, Flag> = new Map()) {

        for (const team of state.teams.values()) {
            const flag = this.makeFlagActor(team.flag);
            map.set(team.id, flag);
        }

        return map;

    }

    public makeFlagActor(schema: FlagSchema) {

        const actor = new Actor(schema.spawn);

        const flag = new Flag(schema);
        actor.addInstance(flag);
        this.game.addActor(actor);

        return flag;

    }

    public makePlayerActor(schema: PlayerSchema) {

        const actor = new Actor(schema.pos);
        const mover = actor.add(new SchemaMover(schema.motion), SchemaMover);
        const player = new Player(schema, this.matchParams);
        actor.addInstance(player);



        const bounds = new MoverBounds(
            new Rectangle(0, 0, this.matchParams.arenaWidth,
                this.matchParams.arenaHeight), schema.radius, mover

        );

        this.game.addActor(actor);

        actor.addInstance(new MatterPlayer(schema), MatterData);

        actor.addInstance(bounds);


        return player;

    }

    public makeBullet(schema: BulletSchema) {

        const actor = new Actor(schema.pos);
        schema.id = actor.id.toString();
        const bullet = actor.addInstance(new Bullet(schema));

        this.boundsDestroy.track(actor);

        if (schema.power > 0) {
            actor.addInstance(new MatterBullet(schema), MatterData);
        }
        this.game.addActor(actor);

        return bullet;

    }

}