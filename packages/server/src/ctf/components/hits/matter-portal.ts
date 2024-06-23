import { IBodyDefinition, Bodies, Pair, Body } from 'matter-js';

import { BlastSchema } from '../../../model/schema/blast-schema';
import { PlayerSchema } from '../../../model/schema/player-schema';
import { MatterData } from './matter-data';
import { Player } from '../player/player';
import { IRegion } from '@/model/regions/iregion';
import { TPoint } from '@/engine/data/geom';
import { HitCategory } from '../../../model/matter';


const PortalBody: IBodyDefinition = {
    frictionAir: 0,
    friction: 0,
    isSensor: true,
    collisionFilter: {
        category: HitCategory.Hittable,
        mask: HitCategory.Player
    }
}

export class MatterPortal extends MatterData<BlastSchema> {

    get radius() { return this.data.radius }
    set radius(v: number) {

        const scale = v / this.data.radius;
        Body.scale(this.body, scale, scale);
        this.data.radius = v;

    }

    private dest?: IRegion | TPoint;

    constructor(schema: BlastSchema, excludeTeam: string, dest?: IRegion | TPoint,) {
        super(
            Bodies.circle(0, 0, schema.radius, PortalBody), schema
        );
        this.dest = dest;
        this.ignoreTeam = excludeTeam;

    }

    init() {
        this.game.state.bodies.set(this.data.id, this.data);
        Body.setPosition(this.body, this.position);
        this.data.pos.setTo(this.position);
    }

    collide(pair: Pair, other?: MatterData) {

        if (other?.data instanceof PlayerSchema && other.data.team !== this.ignoreTeam) {

            const player = other.get(Player);
            if (!player) { return; }

            const dest = this.dest ?? this.getSpawn(other.data.team);
            if (dest) {
                this.game.reposition(player, 'randPoint' in dest ? dest.randPoint() : dest);
            }

        }

    }

    override update(delta: number) {

        this.data.cTime += delta;

        if (this.data.cTime > this.data.time) {

            this.actor?.destroy();

        } else {
            this.radius = this.data.endRadius *
                Math.sin((this.data.cTime / this.data.time) * Math.PI);

            Body.setPosition(this.body, this.position);
        }
    }

    onDestroy() {

        this.game?.state.bodies.delete(this.data.id);
        super.onDestroy?.();
    }

    private getSpawn(team: string) {
        return this.game!.getTeam(team)?.getSpawnRegion();
    }

}