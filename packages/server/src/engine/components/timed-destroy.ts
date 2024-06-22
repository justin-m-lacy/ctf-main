import { Component } from "../component";

export class TimeDestroy extends Component {

	/**
	 * @property {number} time - time in seconds before destroy/effect.
	 * Setting to new value resets the timer.
	 */
	get time(): number { return this._timer; }
	set time(v: number) {
		this._timer = v;
	}

	private _timer: number;

	constructor(time: number) {
		super();
		this._timer = time;
	}

	update(delta: number) {

		if (this._timer > 0) {

			this._timer -= delta;
			if (this._timer <= 0) {

				this.actor!.destroy();

			}
		}

	}

}