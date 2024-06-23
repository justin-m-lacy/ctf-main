import { Query, Engine } from 'matter-js';
import { Component } from '../../../engine/component';
import { SchemaMover } from '../../../engine/components/schema-mover';
import { Point } from '@/engine/data/geom';
import { MatterSystem } from '../../systems/matter-system';
import { Priorities } from '../../data/consts';
import { HitCategory } from '../../../model/matter';

export class RaycastHits extends Component {

    private mover!: SchemaMover;
    private engine!: Engine;

    private nextPt: Point = new Point();

    priority = Priorities.MatterJs;

    constructor() {
        super();
    }

    init() {

        this.mover = this.require(SchemaMover)!;
        const group = this.game.getGroup(MatterSystem)!;
        this.engine = group.engine;

    }

    update(delta: number) {

        const pos = this.position;
        const vel = this.mover.direction;

        this.nextPt.set(pos.x + vel.x * 8, pos.y + vel.y * 8);

        const collisions = Query.ray(this.engine.world.bodies.filter(v => v.collisionFilter.category === HitCategory.Wall), this.position, this.nextPt);

        for (let i = collisions.length - 1; i >= 0; i--) {

            const collide = collisions[i];


            this.position.set(pos.x - collide.penetration.x, pos.y - collide.penetration.y);

        }
    }

}