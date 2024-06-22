import { Component, Game } from 'gibbon.js';
import { Container, Ticker } from 'pixi.js';
import { removeFilter, addFilter } from '../../utils/filters';
import { FlameBurstFilter } from '../../shaders/flame-burst/flame-burst-filter';

type Opts = { totalTime?: number, minR?: number, maxR?: number };

export class FlameBurstFx extends Component<Container, Game> {

    private filter!: FlameBurstFilter;

    private ticker!: Ticker;

    private target: Container;

    private opts?: Opts;
    /**
     * 
     * @param target - filter target.
     */
    constructor(target: Container, opts?: Opts) {

        super();

        this.opts = opts;
        this.target = target;
    }

    public init() {

        this.ticker = this.game!.ticker;

        this.filter = new FlameBurstFilter({
            at: this.position,
            angle: this.rotation,
            totalTime: this.opts?.totalTime,
            minRadius: this.opts?.minR,
            maxRadius: this.opts?.maxR


        });
        console.log(`start r: ${this.opts?.minR}->${this.opts?.maxR}  time: ${this.opts?.totalTime}`);

        this.filter.enabled = false;
    }

    onEnable() {

        addFilter(this.target, this.filter);

        this.filter.time = 0;
        this.filter.enabled = true;

    }
    onDisable() {
        super.onDisable?.();

        this.filter.enabled = false;
        if (this.clip) {

            removeFilter(this.target, this.filter);
        }
    }


    update() {

        this.filter.time += this.ticker.elapsedMS / 1000;
    }

    onDestroy() {

        this.filter.destroy();

        super.onDestroy?.();
    }

}