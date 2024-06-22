import Group from "./group";
import { IUpdater } from "./engine";
import Visual from '../model/visual';
import { Game } from "./game";

export default class System<T extends Game = Game> extends Group<T> implements IUpdater {

	/**
	 * @property {boolean} enabled
	 */
	get running() { return this._running; }
	set running(v) { this._running = v; }

	_running: boolean = false;

	/**
	 *
	 * @param {Game} game
	 * @param {Actor} body - system container clip.
	 */
	constructor(body?: Visual,) {

		super(body,);
	}

	onAdded() {
		if (!this.paused) {
			this.start();
		}
	}

	onRemoved() {
		if (!this.paused) {
			this.stop();
		}
	}

	start() {

		if (!this._running) {
			this.game?.addUpdater(this);
			this._running = true;
		}
		super.unpause();


	}

	stop() {

		if (this._running === true) {
			this.game?.removeUpdater(this);

			this._running = false;
		}
		super.pause();

	}

	pause() {
		this.stop();
	}

	unpause() {
		this.start();
	}

	destroy() {
		this.stop();
		super.destroy();
	}

	/**
	 * Override in subclasses.
	 */
	update(delta: number) { }

}