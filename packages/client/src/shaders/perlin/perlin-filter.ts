import { Filter } from 'pixi.js';
import vert from '../shared.vert?raw';
import fragment from './perlin.frag?raw';

type PerlinParams = {

    width: number,
    height: number,
    seed?: number,

    /**
     * value added or subtracted from perlin value before
     * perlin is applied to image. Higher offset increases
     * the opacity of the underlying image.
     */
    perlinOffset?: number,

    /// color offset to apply to perlin.
    //colorOffset?: number,

    totalSize?: {
        x: number,
        y: number
    }

}

export class PerlinFilter extends Filter {

    constructor(params: PerlinParams) {

        super(vert, fragment, {
            size: [params.width, params.height],
            seed: params.seed ?? 0,
            perlinOffset: params.perlinOffset ?? 0
            /*colorOffset: [

                (0xff & (colorOffset >> 16)) / 255,
                (0xff & (colorOffset >> 8)) / 255,
                (0xff & colorOffset) / 255,
                (0xff & (colorOffset >> 24)) / 255,
            ]*/
        });

        this.autoFit = false;
        if (!this.program.fragmentSrc.includes("#version 300 es")) {
            this.program.vertexSrc = "#version 300 es \n" + this.program.vertexSrc;
            this.program.fragmentSrc =
                "#version 300 es \n" + this.program.fragmentSrc;
        }
    }

}


