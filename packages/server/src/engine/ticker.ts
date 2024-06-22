export interface ITicker {

    start(): void;
    stop(): void;

}
export type IUpdater = (deltaMs: number) => void;

/**
 * Ticker whose ticks are delivered manually.
 */
export class ManualTicker implements ITicker {


    private _onTick?: IUpdater;
    private _running: boolean = false;

    constructor(onTick: IUpdater) {

        this._onTick = onTick;

    }

    start() {
        this._running = true;
    }

    tick(ms: number) {
        if (this._running) {
            this._onTick?.(ms);
        }

    }

    stop() {
        this._running = false;
    }


}