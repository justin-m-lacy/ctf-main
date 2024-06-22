import { IRectangle } from '../../engine/data/geom';
import { Component } from '../../engine/component';
import { Priorities } from '../data/consts';
import { IMover } from '../../engine/components/mover';

/**
 * Bound motion within rect.
 */
export class MoverBounds extends Component {

	/**
	 * @property {Rectangle} bounds - objects in system outside the bounds
	 * will automatically be destroyed unless an onExit() function is specified.
	 * If so, the onExit function will be called instead.
	 */
	readonly bounds: IRectangle;

	private radius: number;

	/**
	 * Optional iMover to zero velocity on hit.
	 */
	private _mover?: IMover;

	priority = Priorities.MoverBounds;

	/**
	 *
	 * @param rect
	 * @param moverRadius - radius of object to push back.
	 * @param mover - if provided, mover's velocity is zeroed in the
	 * direction of an edge hit.
	 */
	constructor(rect: IRectangle, moverRadius: number = 0, mover?: IMover) {

		super();
		this.bounds = rect;
		this.radius = moverRadius;
		this._mover = mover;

	}

	init() {
	}

	update() {

		const pos = this.position;

		if (pos.x - this.radius < this.bounds.x) {

			if (this._mover) {

				this._mover.velocity = { x: 0, y: this._mover.velocity.y };

			}

			pos.x = this.bounds.x + this.radius + 1;

		} else if (pos.x + this.radius > this.bounds.x + this.bounds.width) {
			pos.x = this.bounds.x + this.bounds.width - 1 - this.radius;

			if (this._mover) {

				this._mover.velocity = { x: 0, y: this._mover.velocity.y };

			}

		}

		if (pos.y - this.radius < this.bounds.y) {

			pos.y = this.bounds.y + this.radius + 1;

			if (this._mover) {
				this._mover.velocity = { x: this._mover.velocity.x, y: 0 };
			}

		} else if (pos.y + this.radius > this.bounds.y + this.bounds.height) {

			pos.y = this.bounds.y + this.bounds.height - 1 - this.radius;
			if (this._mover) {
				this._mover.velocity = { x: this._mover.velocity.x, y: 0 };
			}
		}

	}

}