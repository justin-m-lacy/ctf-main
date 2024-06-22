import { ShockwaveFilter } from '@pixi/filter-shockwave';
import { Graphics, Container, Point, Filter } from 'pixi.js';
import { Component } from 'gibbon.js';
import { BlastSchema } from '../../../../server/src/model/schema/blast-schema';

import { addFilter } from '../../utils/filters';
import { ClientGame } from '@/client-game';

//const blastTex = makeDropletTexture(64);

const blastColor = 0xaa5500;
const blastAlpha = 0.0;

export class Blast extends Component<Container, ClientGame> {

    filter?: Filter;
    display: Container;

    /**
     * Filter target.
     */
    target?: Container;

    private glob: Point = new Point();

    private blast: BlastSchema;

    constructor(blast: BlastSchema) {

        super();

        this.blast = blast;

        this.display = this.initClip(blast.endRadius);
        this.display.width = this.display.height = 2 * this.blast.extents.x + 2;
        this.display.x = blast.pos.x;
        this.display.y = blast.pos.y;

    }

    update(deltaTime: number) {

        //this.display.width = this.display.height = (2 * this.blast.radius) + 2;

        if (this.filter) {
            const wave = this.filter as ShockwaveFilter;


            this.display.toGlobal(new Point(), this.glob);

            wave.time += deltaTime;
            wave.center = this.glob;
        }
    }

    public addTo(container: Container, filterTarget: Container) {

        container.addChild(this.display);
        this.target = filterTarget;

        this.display.toGlobal(new Point(), this.glob);

        const speed = (this.blast.endRadius - this.blast.startRadius) / this.blast.time;

        this.filter = new ShockwaveFilter(this.glob, {
            radius: this.blast.endRadius,
            wavelength: 0.5 * this.blast.endRadius,
            speed: speed
        });

        addFilter(filterTarget, this.filter);

    }

    private initClip(radius: number) {
        const g = new Graphics();
        g.beginFill(blastColor, blastAlpha);
        g.drawCircle(0, 0, radius);
        g.endFill();

        return g;
    }

    onDestroy() {

        if (this.target?.filters && this.filter) {

            const ind = this.target.filters.indexOf(this.filter);
            this.target.filters.splice(ind, 1);
            this.target = undefined;

        }
        this.filter = undefined;

        this.display.destroy(true);

    }

}