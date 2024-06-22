import { Component, Game, EngineEvent } from 'gibbon.js';
import { Resource, Sprite, Ticker } from 'pixi.js';
import { CutAwayFilter } from '../../shaders/cut-away-filter/cut-away-filter';
import { addFilter, removeFilter } from '../../utils/filters';
import { Texture } from 'pixi.js';
import { IRectangle } from '../../../../server/src/engine/data/geom';


/**
 * Splashscreen disabled by default.
 * Call play() to animate out.
 */
export class SplashScreen extends Component<Sprite, Game> {

    public static EvtComplete = 'complete';

    public get texture() { return this.clip?.texture }
    public set texture(v: Texture<Resource> | undefined) {
        if (this.clip && v) {
            this.clip.texture = v;
        }
    }

    public get effectTime() {
        return this._effectTime;
    }
    public set effectTime(v: number) {
        this._effectTime = v;
        if (this.outFilter) {
            this.outFilter.effectTime = v;
        }
    }
    public get size() {
        const clip = this.clip!;
        return { x: clip.width, y: clip.height };
    }
    public set size(pt: { x: number, y: number }) {
        const clip = this.clip!;
        clip.width = pt.x;
        clip.height = pt.y;
    }

    private _effectTime: number = 2;

    private outFilter?: CutAwayFilter;

    private ticker!: Ticker;

    init() {

        this.ticker = this.game!.app.ticker;
        this.enabled = false;

        this.game!.on(EngineEvent.ScreenResized, this.onResized, this);

    }

    private onResized(rect: IRectangle) {
        this.clip!.width = rect.width;
        this.clip!.height = rect.height;
    }

    /**
     * play animation and destroy.
     */
    public play() {

        this.outFilter = this.outFilter ?? new CutAwayFilter({

            effectTime: this._effectTime, cutHeight: 240, angle: Math.PI / 4
        });
        this.outFilter.time = 0;
        this.enabled = true;
    }

    update() {

        if (this.outFilter) {

            this.outFilter.time += this.ticker.elapsedMS / 1000;
            if (this.outFilter.time >= this._effectTime) {
                this.clip!.visible = false;
                this.emit(SplashScreen.EvtComplete);
            }

        }
    }

    onEnable() {

        if (this.outFilter) {
            this.outFilter.enabled = true;
            addFilter(this.clip!, this.outFilter);
        }

    }

    onDisable() {

        if (this.outFilter) {
            this.outFilter.enabled = false;
        }
    }

    onDestroy() {

        this.game?.off(EngineEvent.ScreenResized, this.onResized, this);

        if (this.outFilter) {
            if (this.clip) {
                removeFilter(this.clip, this.outFilter);
            }
            this.outFilter.destroy();
        }
        this.outFilter = undefined;
    }

}