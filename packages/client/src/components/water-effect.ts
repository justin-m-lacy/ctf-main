import { Component } from 'gibbon.js';
import { Container, Sprite } from 'pixi.js';
import { addFilter } from '@/utils/filters';
import { WaterFilter } from '../shaders/water/water-filter';
import { removeFilter } from '../utils/filters';

export class WaterEffect extends Component<Container> {

    private readonly filterSprite: Sprite;

    private readonly filter: WaterFilter;

    // prevent different water sync
    private timer: number = 2 * Math.random();

    private filterTarget?: Container;

    priority = 0;

    /**
     * 
     * @param filterSprite - sprite holding the displacement texture.
     */
    constructor(filterSprite: Sprite, filterTarget?: Container, opts?: ConstructorParameters<typeof WaterFilter>[1]) {
        super();

        this.filterSprite = filterSprite;
        this.filterTarget = filterTarget;

        this.filter = new WaterFilter(filterSprite, opts);

        this.filter.padding = -4;

    }

    init() {

        if (!this.filterTarget) {
            this.filterTarget = this.clip!;
        }
        addFilter(this.filterTarget, this.filter);
        if (this.filterSprite.parent == null) {
            this.filterTarget.addChild(this.filterSprite);
        }

    }

    update(delta: number) {


        this.timer += 1.5 * delta;
        this.filter.time = this.timer;

        /*this.filter.scale.set(this.maxScale * Math.sin(this.timer) * Math.cos(this.timer), this.maxScale * Math.sin(0.75 * this.timer));*/
        //this.filterSprite.rotation += delta / 32;

    }

    onDestroy() {
        if (this.filterTarget) {
            removeFilter(this.filterTarget, this.filter);
        }
        this.filter.destroy();
    }

}