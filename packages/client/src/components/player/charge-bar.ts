import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';

/// UNUSED.
export class ChargeBar extends Component<Container>{

    private maxCharge: number = 1;

    private schema: PlayerSchema;

    private readonly bar: Container;

    constructor(schema: PlayerSchema, clip: Container, maxCharge: number) {
        super();

        this.schema = schema;
        this.maxCharge = maxCharge;

        this.bar = clip;
        this.bar.visible = false;

    }

    init() {

        if (!this.bar.parent && this.clip !== this.bar) {
            this.clip!.addChild(this.bar);
        }
    }

    update() {

        let pct: number = this.schema.chargeTime / this.maxCharge;
        if (pct > 1) {
            pct = 1;
        } else if (pct < 0) {
            pct = 0;
        }

        this.bar.scale.x += (pct - this.bar.scale.x) / 8;

    }

    onActivate() {
        this.bar.scale.x = 0;
        this.bar.visible = true;
    }
    onDeactivate() {
        this.bar.visible = false;
    }

}