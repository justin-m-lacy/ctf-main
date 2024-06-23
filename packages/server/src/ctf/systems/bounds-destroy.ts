import System from '@/engine/system';
import { quickSplice } from '@/engine/utils/array-utils';
import Actor from '../../engine/actor';
import { IRectangle } from '../../engine/data/geom';


/**
 *
 */
export class BoundsDestroyGroup extends System {

	/**
	 * @property {Rectangle} bounds - objects in system outside the bounds
	 * will automatically be destroyed unless an onExit() function is specified.
	 * If so, the onExit function will be called instead.
	 */
	readonly bounds: IRectangle;

	readonly watching: Actor[] = [];

	/**
	 *
	 * @param rect
	 */
	constructor(rect: IRectangle) {

		super();
		this.bounds = rect;

	}

	public track(actor: Actor) {
		this.watching.push(actor);
	}

	update() {

		for (let i = this.watching.length - 1; i >= 0; i--) {

			const o = this.watching[i];
			if (o.isDestroyed) {
				quickSplice(this.watching, i);
				continue;
			}

			const pos = o.position;
			if (this.bounds.contains(pos) === false) {
				o.destroy();
				quickSplice(this.watching, i);

			}

		}

	}

}