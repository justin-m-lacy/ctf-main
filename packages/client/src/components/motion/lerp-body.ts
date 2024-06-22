import { Priorities } from '@/priorities';
import { Component } from 'gibbon.js';
import { BodySchema } from '../../../../server/src/model/schema/body-schema';


export class LerpBody extends Component {

    private readonly data: BodySchema;

    priority = Priorities.ServerSync;

    constructor(data: BodySchema) {

        super();
        this.data = data;

    }

    init() {
        this.position.set(this.data.pos.x, this.data.pos.y);
    }

    update(delta: number) {

        const dest = this.data.pos;
        const pos = this.position;

        pos.set(pos.x + (dest.x - pos.x) * delta / 0.1, pos.y + (dest.y - pos.y) * delta / 0.1);

    }


}