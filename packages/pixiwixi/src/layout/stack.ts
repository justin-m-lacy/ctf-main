import { Rectangle, Container, DisplayObject, Point } from 'pixi.js';
import { ListLayout, isLayout, IDisplay, Positionable, ILayout } from './layout';

/**
 * Allow child items to overlay each other.
 */
export class Stack extends ListLayout {

	private align: Point = new Point(0, 0);

	/**
	 * Add children to parent during layout and return
	 * as layout result.
	 */
	private parent?: Container;


	/**
	 * 
	 * @param params
	 * @param params.parent - Add all child nodes to parent and return as layout() result.
	 * @param params.align - Alignment of items in stack, from -1 to 1.
	 * In either dimension, -1 represents aligning the item on the start of the axis,
	 * +1 on the end.
	 */
	constructor(items?: (ILayout | Container)[], params?: {

		parent?: Container,
		align?: Point
	}) {

		super(items);

		this.parent = params?.parent;

		if (params?.align) {
			this.align.set(params.align.x, params.align.y);
		}

	}


	public layout(rect: Rectangle, parent?: Container): IDisplay {

		const items = this.items;
		const len = items.length;

		const useParent = this.parent ?? parent;
		const displays: IDisplay[] = [];

		let display: IDisplay
		for (let i = 0; i < len; i++) {

			const child = items[i];
			//console.log(`item name: ${Object.getPrototypeOf(child).constructor.name}`)
			if (isLayout(child)) {

				display = child.layout(rect, useParent);

			} else {

				display = child;
			}

			display.x = rect.x + (1 + this.align.x) * 0.5 * (rect.width - display.width);
			display.y = rect.y + (1 + this.align.y) * 0.5 * (rect.height - display.height);

			if (display instanceof DisplayObject) {
				useParent?.addChild(display);
			}

			displays.push(display);


		}

		return new Positionable(displays, rect);

	} // arrange()

}