import { Component } from '../../engine/component';
import { FlagSchema, FlagState } from '../../model/schema/flag-schema';
export class Flag extends Component {

    private readonly schema: FlagSchema;

    public get carrier() { return this.schema.carrier }

    constructor(schema: FlagSchema) {

        super();
        this.schema = schema;

    }

    init() { this.restore(); }

    saved(by: string) {
        const spawn = this.schema.spawn;

        this.schema.state = FlagState.base;
        this.schema.carrier = undefined;
        this.schema.pos.setTo(spawn);
        this.position.set(spawn.x, spawn.y);

    }

    restore() {
        const spawn = this.schema.spawn;

        this.schema.state = FlagState.base;
        this.schema.carrier = undefined;
        this.schema.pos.setTo(spawn);
        this.position.set(spawn.x, spawn.y);

    }



}