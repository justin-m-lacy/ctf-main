import { Container, Point } from 'pixi.js';
import { BlastSchema } from '../../../../server/src/model/schema/blast-schema';
import { TwistFilter } from '@pixi/filter-twist';

//import { DisplacementFilter } from '@pixi/filter-displacement';
import { addFilter, removeFilter } from '../../utils/filters';
import { Component } from 'gibbon.js';

//const blastTex = makeDropletTexture(64);

export class Vortex extends Component {

    private filter?: TwistFilter;
    private glob: Point = new Point();

    private blast: BlastSchema;

    /**
     * Filter target.
     */
    private target?: Container;

    private container?: Container;

    constructor(blast: BlastSchema) {

        super();
        this.blast = blast;

    }

    update(dt: number) {

        if (this.filter) {


            //this.container?.toGlobal(this.blast.pos, this.filter.offset);
            this.filter.radius = this.blast.extents.x;

            this.filter.angle += 10 * dt;
            this.container!.toGlobal(this.blast.pos, this.glob);
            //this.target?.toLocal(this.glob, this.container);

        }
    }

    public addTo(container: Container, filterTarget: Container) {


        this.container = container;

        this.filter = new TwistFilter({
            radius: this.blast.extents.x,
            angle: 0,
            padding: 8
        });
        container.toGlobal(this.blast.pos, this.glob);

        this.filter.offset = this.glob;

        this.target = filterTarget;
        addFilter(filterTarget, this.filter);

    }

    onDestroy() {

        if (this.target && this.filter) {
            removeFilter(this.target, this.filter);
        }
        this.filter?.destroy();

        this.target = undefined;
        this.container = undefined;
        this.filter = undefined;


    }

}