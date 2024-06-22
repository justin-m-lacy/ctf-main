import { Component } from '../../engine/component';
import { BulletSchema } from '../../model/schema/bullet-schema';
import Mover from '../../engine/components/mover';
import { CtfMatch } from '../ctf-match';

export class Bullet extends Component<CtfMatch> {

    public readonly schema: BulletSchema;

    constructor(schema: BulletSchema) {

        super();
        this.schema = schema;

    }

    init() {

        const schema = this.schema;
        const mover = this.require(Mover);

        mover.speedMax = schema.speed;
        this.rotation = schema.angle;

        mover.velocity.set(Math.cos(schema.angle) * schema.speed, Math.sin(schema.angle) * schema.speed);

    }

    update(delta: number) {

        this.schema.timer += delta;
        if (this.schema.timer >= this.schema.time) {
            this.actor?.destroy();
        }

    }

}