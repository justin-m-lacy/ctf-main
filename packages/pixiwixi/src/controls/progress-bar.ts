import { Container, Ticker } from 'pixi.js';

export class ProgressBar extends Container {

	private _progress: number = 0;
	private _loading: boolean = false;
	private _complete: boolean = false;

	get progress() { return this._progress }
	get loading() { return this._loading && !this._complete }
	get isComplete(): boolean { return this._complete; }


	/**
	 * Ticker used to advanced progress bar.
	 * Defaults to PIXI.Ticker.shared.
	 */
	private _ticker: Ticker;

	protected back: Container;
	protected bar: Container;


	constructor(back: Container, bar: Container, ticker?: Ticker) {

		super();

		this._ticker = ticker ?? Ticker.shared;

		this.back = back;
		this.bar = bar;

		bar.x = back.x + 2;
		bar.y = (back.height - bar.height) / 2;

		this.addChild(back);
		this.addChild(bar);

		this._loading = false;
		this._complete = false;

	}

	/**
	 * 
	 * @param percent 1-based percent.
	 */
	updateProgress(percent: number) {

		this._progress = percent;

		if (percent >= 1) {

			this._complete = true;
			this._loading = false;

		} else {

			this.bar.scale.x += (percent - this.bar.scale.x) / 8;

		}

	}

	complete() {

		Ticker.shared.remove(this.updateProgress, this);
		this._complete = true;
		this._loading = false;

	}

	stop() {

		Ticker.shared.remove(this.updateProgress, this);
		this._loading = false;
		this._complete = false;

	}

}