import { Rectangle } from 'pixi.js';
import { Component } from 'gibbon.js';
import { Priorities } from '../priorities';

/// Bound motion within rect.
/// Currently Unused
export class MoverBounds extends Component {

	/**
	 * @property {Rectangle} bounds - objects in system outside the bounds
	 * will automatically be destroyed unless an onExit() function is specified.
	 * If so, the onExit function will be called instead.
	 */
	public readonly bounds: Rectangle;

	private radius: number;

	priority = Priorities.Bounds;

	/**
	 *
	 * @param rect
	 * @param moverRadius - radius of object to push back.
	 * @param mover - if provided, mover's velocity is zeroed in the
	 * direction of an edge hit.
	 */
	constructor(rect: Rectangle, moverRadius: number = 0) {

		super();
		this.bounds = rect;
		this.radius = moverRadius;


	}

	update() {

		const pos = this.position;
		let hitEdge: boolean = false;

		if (pos.x - this.radius < this.bounds.x) {
			pos.x = this.bounds.x + this.radius + 1;
			hitEdge = true;


		} else if (pos.x + this.radius > this.bounds.x + this.bounds.width) {
			pos.x = this.bounds.x + this.bounds.width - 1 - this.radius;
			hitEdge = true;

		}

		if (pos.y - this.radius < this.bounds.y) {
			pos.y = this.bounds.y + this.radius + 1;
			hitEdge = true;


		} else if (pos.y + this.radius > this.bounds.y + this.bounds.height) {
			pos.y = this.bounds.y + this.bounds.height - 1 - this.radius;
			hitEdge = true;
		}


	}

}