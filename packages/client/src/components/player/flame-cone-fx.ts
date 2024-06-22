import { Component, Game } from 'gibbon.js';
import { Container, Ticker } from 'pixi.js';
import { FlameConeFilter } from '../../shaders/flame-cone/flame-cone-filter';
import { removeFilter, addFilter } from '../../utils/filters';

export class FlameConeFx extends Component<Container, Game> {

    private filter!: FlameConeFilter;

    private ticker!: Ticker;

    private target: Container;

    /**
     * 
     * @param target - filter target.
     */
    constructor(target: Container) {

        super();

        this.target = target;
    }

    public init() {

        this.ticker = this.game!.ticker;

        this.filter = new FlameConeFilter({
            at: this.position,
            angle: this.rotation

        });
        this.filter.enabled = false;

        // this.filterClip.filters = [this.filter];
    }

    onEnable() {

        addFilter(this.target, this.filter);

        this.filter.time = 0;
        this.filter.enabled = true;

    }
    onDisable() {
        super.onDisable?.();

        console.log(`flame cone disable.`);
        this.filter.enabled = false;
        if (this.target) {

            removeFilter(this.target, this.filter);
        }
    }


    update() {

        this.filter.time += this.ticker.elapsedMS / 1000;

        this.filter.angle = this.rotation;
        this.filter.at = this.position;

    }

    onDestroy() {

        console.log(`flame cone destroy...`);

        this.filter.enabled = false;
        this.filter.destroy();

        super.onDestroy?.();
    }

}