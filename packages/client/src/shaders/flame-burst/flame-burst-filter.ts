import { Filter, FilterSystem, RenderTexture, CLEAR_MODES, FilterState, utils, DisplayObject, IPointData } from 'pixi.js';
import vert from './flame-burst.vert?raw';
import frag from './flame-burst.frag?raw';

import { addGlslVersion } from '../../utils/filter';

const versVert = addGlslVersion(vert);
const versFrag = addGlslVersion(frag);

export class FlameBurstFilter extends Filter {

    public get minRadius(): number { return this.uniforms.minRadius; }
    public set minRadius(r: number) { this.uniforms.minRadius = r; }

    public get maxRadius(): number { return this.uniforms.maxRadius; }
    public set maxRadius(r: number) { this.uniforms.maxRadius = r; }

    public get totalTime(): number { return this.uniforms.totalTime; }
    public set totalTime(v: number) { this.uniforms.totalTime = v; }

    public get loop(): boolean { return this.uniforms.loop; }
    public set loop(v: boolean) { this.uniforms.loop = v; }

    public get time() { return this.uniforms.time; }
    public set time(v) { this.uniforms.time = v; }

    /**
     * two colors for first ring.
     */
    public get colors1(): [number, number] {
        return this.uniforms.colors1.map(utils.rgb2hex);
    }
    public set colors1(colors: [number, number]) {
        this.uniforms.colors1 = colors.map((v) => utils.hex2rgb(v)).flat();
    }

    /**
     * two colors for second ring.
     */
    public get colors2(): [number, number] {
        return this.uniforms.colors2.map(utils.rgb2hex);
    }
    public set colors2(colors: [number, number]) {
        this.uniforms.colors2 = colors.map((v) => utils.hex2rgb(v)).flat();
    }


    private _at: IPointData;

    constructor(params: {
        at: { x: number, y: number },
        // maximum radius
        maxRadius?: number,
        minRadius?: number,
        colors1?: [number, number],
        colors2?: [number, number],
        angle?: number,
        totalTime?: number,
        loop?: boolean,
        seed?: number
    }) {

        super(versVert, versFrag,
            {
                minRadius: params.minRadius ?? 20,
                maxRadius: params.maxRadius ?? 400,
                worldPos: params.at,
                time: 0,
                totalTime: params.totalTime ?? 0.6,
                loop: params.loop ?? false,
                colors1: (params.colors1 ?? [0xffbf00, 0xffdc73]).map(v => utils.hex2rgb(v)).flat(),
                colors2: (params.colors2 ?? [0xa67c00, 0xbf9b30]).map(v => utils.hex2rgb(v)).flat(),
                angle: params.angle ?? 0,
                seed: params.seed ?? Date.now()
            });

        this._at = params.at;

    }



    public override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _state?: FilterState): void {

        if (_state?.target instanceof DisplayObject) {
            this.uniforms.worldPos = _state.target.worldTransform.apply(this._at);
            super.apply(filterManager, input, output, clearMode, _state);

        }


    }

}