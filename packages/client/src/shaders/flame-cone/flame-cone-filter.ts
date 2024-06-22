import { Filter, FilterSystem, RenderTexture, CLEAR_MODES, FilterState, utils, DisplayObject, Point } from 'pixi.js';
import vert from './flame-cone.vert?raw';
import frag from './flame-1.frag?raw';
import { addGlslVersion } from '../../utils/filter';

export class FlameConeFilter extends Filter {


    public get time() { return this.uniforms.time; }
    public set time(v) { this.uniforms.time = v; }

    /**
     * length of cone along x-axis.
     */
    public get length(): number { return this.uniforms.xLen; }
    public set length(r: number) { this.uniforms.xLen = r; }


    /**
     * base of cone centered across y.
     */
    public get base(): number { return this.uniforms.yLen * 2; }
    public set base(r: number) { this.uniforms.yLen = r / 2; }


    public get angle(): number { return this.uniforms.angle; }
    public set angle(r: number) { this.uniforms.angle = r; }


    /**
     * Time to reach full length.
     */
    public get growTime(): number { return this.uniforms.growTime; }
    public set growTime(r: number) { this.uniforms.growTime = r; }

    /**
     * two colors for first ring.
     */
    public get colors(): [number, number] { return this.uniforms.colors.map(utils.rgb2hex); }
    public set colors(colors: [number, number]) {
        this.uniforms.colors = colors.map((v) => utils.hex2rgb(v)).flat();
    }

    public get at(): Point { return this._at; }
    public set at(p: Point) {
        this._at.set(p.x, p.y);
    }
    private _at: Point;


    /**
     * 
     * @param params.at - flame position relative to filtered clip..
     */
    constructor(params: {
        at: Point,
        length?: number,
        base?: number,
        colors?: [number, number],
        angle?: number,
        growTime?: number,
        seed?: number
    }) {

        //e8c709
        super(addGlslVersion(vert), addGlslVersion(frag),
            {
                worldPos: params.at,
                xLen: params.length ?? 220,
                yLen: (params.base ?? 280) / 2,
                time: 0,
                growTime: params.growTime ?? 1.1,
                angle: params.angle ?? 0,
                seed: params.seed ?? Date.now()
            });

        this._at = params.at;

    }



    public override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _state?: FilterState): void {

        const targ = _state?.target;

        if (targ instanceof DisplayObject) {

            this.uniforms.worldPos = targ.worldTransform.apply(this._at);

            super.apply(filterManager, input, output, clearMode, _state);

        }

    }

}