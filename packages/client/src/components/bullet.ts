import { Component, Mover } from 'gibbon.js';
import { BulletSchema } from '../../../server/src/model/schema/bullet-schema';
import { Container } from 'pixi.js';

export class Bullet extends Component<Container> {

    public readonly schema: BulletSchema;

    private mover!: Mover;

    constructor(schema: BulletSchema) {

        super();
        this.schema = schema;

    }

    init() {

        const schema = this.schema;

        this.mover = this.require(Mover);
        this.mover.velocityMax = schema.speed;

        const pos = this.position;
        const angle = Math.atan2(schema.dest.y - pos.y, schema.dest.x - pos.x);
        this.mover.velocity.set(schema.speed * Math.cos(angle), schema.speed * Math.sin(angle));

        this.rotation = angle;

    }


}