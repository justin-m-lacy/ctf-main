import { Filter, FilterSystem, RenderTexture, CLEAR_MODES, FilterState, utils, DisplayObject, Point } from 'pixi.js';
import vert from './bubble.vert?raw';
import frag from './bubble.frag?raw';

import { addGlslVersion } from '../../utils/filter';

export class BubbleFilter extends Filter {


    public get time() { return this.uniforms.time; }
    public set time(v) { this.uniforms.time = v; }

    public get radius(): number {
        return this.uniforms.radius;
    }
    public set radius(r: number) {
        this.uniforms.radius = r;
    }

    public get alpha(): number {
        return this.uniforms.alpha;
    }
    public set alpha(r: number) {
        this.uniforms.alpha = r;
    }


    public get color1(): number {
        return utils.rgb2hex(this.uniforms.color1);
    }
    public set color1(v: number) {
        this.uniforms.color1 = utils.hex2rgb(v);
    }

    public get color2(): number {
        return utils.rgb2hex(this.uniforms.color2);
    }
    public set color2(v: number) {
        this.uniforms.color2 = utils.hex2rgb(v);
    }


    /**
     * 
     * @param params.knockout - ignore container graphic.
     */
    constructor(params: {
        radius?: number,
        color1?: number,
        color2?: number,
        angle?: number,
        seed?: number,
        alpha?: number,
        knockout?: boolean
    }) {

        super(addGlslVersion(vert), addGlslVersion(frag),
            {
                radius: params.radius ?? 100,
                time: 0,
                alpha: params.alpha ?? 1,
                color1: utils.hex2rgb(params.color1 ?? 0x7c9feb),
                color2: utils.hex2rgb(params.color2 ?? 0xf0f7ff),
                baseAlpha: params.angle ?? 0,
                seed: params.seed ?? Date.now(),
                knockout: params.knockout ?? false
            });


    }



    public override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _state?: FilterState): void {

        if (_state?.target instanceof DisplayObject) {

            this.uniforms.alpha = _state.target.alpha;
            this.uniforms.localPos = _state.target.worldTransform.apply(_state.target.position);

            super.apply(filterManager, input, output, clearMode, _state);
        }

    }

}