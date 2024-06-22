import { Filter, FilterSystem, RenderTexture, CLEAR_MODES, FilterState, utils, PI_2, Sprite, Matrix } from 'pixi.js';
import vert from './water.vert?raw';
import frag from './water.frag?raw';
import { addGlslVersion } from '../../utils/filter';

const versVert = addGlslVersion(vert);
const versFrag = addGlslVersion(frag);

/**
 * Top-down water-filter.
 */
export class WaterFilter extends Filter {

    /**
     * base wavelength
     */
    public get lambda() { return PI_2 / this.uniforms.freq; }
    public set lambda(v) { this.uniforms.freq = PI_2 / v; }

    /**
     * wave amplitude ( maximum offset)
     */
    public get amplitude() { return this.uniforms.amp; }
    public set amplitude(v) { this.uniforms.amp = v; }

    public get tint(): number { return utils.rgb2hex(this.uniforms.tint); }
    public set tint(c: number) { this.uniforms.tint = utils.hex2rgb(c); }

    /**
     * perlin seed.
     */
    public get seed() { return this.uniforms.seed; }
    public set seed(v) { this.uniforms.seed = v; }

    /**
     * water opacity.
     */
    public get alpha() { return this.uniforms.alpha; }
    public set alpha(v) { this.uniforms.alpha = v; }

    /**
     * Timer for any wave effects.
     */
    public get time() { return this.uniforms.time; }
    public set time(v) { this.uniforms.time = v; }

    private mask: Sprite;
    private maskMatrix: Matrix;

    /**
     * 
     * @param mask - Masks in the water effect.
     * @param opts 
     */
    constructor(mask: Sprite, opts?: {
        /// wavelength
        lambda?: number,
        seed?: number,
        tint?: number,
        alpha?: number,
        amplitude?: number

    }) {

        const mat = new Matrix();
        mask.renderable = false;

        super(versVert, versFrag,
            {
                time: 0,
                maskTex: mask._texture,
                amp: opts?.amplitude ?? 8,
                seed: opts?.seed ?? Date.now(),
                freq: PI_2 / (opts?.lambda ?? 400),
                alpha: opts?.alpha ?? 1,
                maskMatrix: mat,
                tint: utils.hex2rgb(opts?.tint ?? 0x000077),
                //rotation: new Float32Array([1, 0, 0, 1]),

            });

        this.mask = mask;
        this.maskMatrix = mat;

    }



    public override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _state?: FilterState): void {

        // fill maskMatrix with _normalized sprite texture coords_
        //this.uniforms.maskMatrix = this.mask.transform.worldTransform;
        this.uniforms.maskMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.mask);

        this.uniforms.worldPos = this.mask.position;

        super.apply(filterManager, input, output, clearMode, _state);



    }

}