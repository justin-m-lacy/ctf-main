import { Filter, FilterSystem, RenderTexture, CLEAR_MODES, FilterState, Sprite, DisplayObject } from 'pixi.js';
import vert from './cut-away.vert?raw';
import frag from './cut-away.frag?raw';
import { addGlslVersion } from '../../utils/filter';

const versVert = addGlslVersion(vert);
const versFrag = addGlslVersion(frag);

export class CutAwayFilter extends Filter {

    /**
     * Total effect time in seconds.
     */
    public get effectTime(): number { return this.uniforms.effectTime; }
    public set effectTime(v: number) { this.uniforms.effectTime = v }

    /**
     * Cut-away angle in radians.
     */
    public get angle(): number { return this.uniforms.angle; }
    public set angle(v: number) { this.uniforms.angle = v }

    /**
     * Height of each cut-away section.
     */
    public get cutHeight(): number { return this.uniforms.cutHeight }
    public set cutHeight(v: number) { this.uniforms.cutHeight = v }

    public get time(): number { return this.uniforms.time; }
    public set time(v: number) { this.uniforms.time = v; }

    public get loop(): number { return this.uniforms.loop; }
    public set loop(v: number) { this.uniforms.loop = v; }

    constructor(params?: { angle?: number, cutHeight?: number, effectTime?: number, loop?: boolean }) {

        super(versVert, versFrag,
            {
                loop: params?.loop ?? false,
                time: 0,
                angle: params?.angle ?? 0,
                cutHeight: params?.cutHeight ?? 80,
                effectTime: params?.effectTime ?? 2,
            });

    }

    public override apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode?: CLEAR_MODES, _state?: FilterState): void {

        if (_state?.target instanceof DisplayObject) {

            this.uniforms.worldPos = _state.target.worldTransform.apply(_state.target.position);

            super.apply(filterManager, input, output, clearMode, _state);
        }

    }

}