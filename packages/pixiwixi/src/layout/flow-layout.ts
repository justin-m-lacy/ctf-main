import { Rectangle, Container, DisplayObject } from 'pixi.js';
import { ILayout, ListLayout, Axis, Align, isLayout, alignItem, IDisplay, Positionable } from './layout';



/**
 * Lays out container children in order without regard for size or available space.
 */
export class FlowLayout extends ListLayout {

	private axis: Axis = Axis.Horizontal;

	private align: Align;

	private justify: Align;

	private spacing: number = 0;

	/**
	 * Add children to parent during layout and return
	 * as layout result.
	 */
	private parent?: Container;

	/**
	 * Whether to allow the layout to overflow.
	 */
	private overflow: boolean;

	/**
	 * 
	 * @param params
	 * @param params.parent - Add all child nodes to parent and return as layout() result.
	 */
	constructor(params: {
		items?: (ILayout | Container)[],
		axis?: Axis,
		spacing?: number,
		align?: Align,
		justify?: Align,
		parent?: Container,
		overflow?: boolean
	}) {

		super(params.items);

		this.parent = params.parent;
		this.overflow = params.overflow ?? false;
		this.justify = params.justify ?? Align.Start;
		this.axis = params.axis ?? Axis.Vertical;
		this.spacing = params.spacing ?? 0;
		this.align = params.align ?? Align.Center;

	}


	public layout(rect: Rectangle, parent?: Container): IDisplay {

		const spacing = this.spacing;
		const items = this.items;
		const len = items.length;

		//console.log(`flow layout...: ${rect?.x},${rect?.y}  size: ${rect?.width},${rect?.height}`)

		/// space used.
		const freeSpace = new Rectangle(rect.x, rect.y, rect.width, rect.height);

		let sizeProp: 'width' | 'height';
		let prop: 'x' | 'y';
		let alignAxis: Axis;

		if (this.axis === Axis.Horizontal) {
			prop = 'x';
			sizeProp = 'width';
			alignAxis = Axis.Vertical;
		} else {
			prop = 'y';
			sizeProp = 'height';
			alignAxis = Axis.Horizontal;
		}

		const useParent = this.parent ?? parent;
		let display: IDisplay
		let displays: IDisplay[] = [];

		for (let i = 0; i < len; i++) {

			const child = items[i];
			//console.log(`item name: ${Object.getPrototypeOf(child).constructor.name}`)
			if (isLayout(child)) {
				display = child.layout(freeSpace, useParent);
				display[prop] = freeSpace[prop];

			} else {
				child[prop] = freeSpace[prop];
				display = child;
			}

			/// advance available rect.
			if (this.overflow === false) {
				freeSpace[sizeProp] -= (display[sizeProp] + spacing);
			}
			freeSpace[prop] = display[prop] + display[sizeProp] + spacing;

			if (display instanceof DisplayObject) {
				useParent?.addChild(display);
			}
			displays.push(display);


			alignItem(display, rect, alignAxis, this.align);


			//console.log(`avail: y: ${available.y}->${available.y + available.height}`);
			// decrease available space.


		}

		const pos = new Positionable(displays, freeSpace);
		if (this.justify === Align.Center) {
			pos[prop] = (rect[sizeProp] - pos[sizeProp]) * 0.5;
		} else if (this.justify === Align.End) {
			pos[prop] = rect[sizeProp] - pos[sizeProp];
		}
		return pos;

	} // arrange()

}