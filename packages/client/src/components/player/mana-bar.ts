import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';

/**
 * Replaced with arcmeter.
 */
export class ManaBar extends Component<Container>{

    private schema: PlayerSchema;

    private readonly bar: Container;

    private maxWidth: number;
    constructor(schema: PlayerSchema, clip: Container, maxWidth: number) {
        super();

        this.schema = schema;

        this.bar = clip;
        this.maxWidth = maxWidth;

        this.bar.visible = false;

    }

    init() {

        if (!this.bar.parent && this.clip !== this.bar) {
            this.clip!.addChild(this.bar);
        }
        this.bar.width = this.maxWidth;

    }

    update() {

        let pct: number = this.schema.manaPct;
        if (pct > 1) {
            pct = 1;
        } else if (pct < 0) {
            pct = 0;
        }

        this.bar.width += (pct * this.maxWidth - this.bar.width) / 8;

    }

    onActivate() {
        this.bar.width = 0;
        this.bar.visible = true;
    }
    onDeactivate() {
        this.bar.visible = false;
    }

}