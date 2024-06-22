import { DefaultSkin } from './../defaults';
import { Container, DisplayObject, Rectangle, Point, NineSlicePlane } from 'pixi.js';
import { IDisplay, ILayout, isLayout } from './layout';

/**
 * Offsets child object from the view Rectangle by a scroll amount.
 */
export class Scroll implements ILayout {

    public get scroll() { return this._scroll }
    public set scroll(v) {
        this._scroll = v;
    }
    /**
     * Current scroll. Change and call layout() again.
     */
    private _scroll: number = 0;

    private readonly child: ILayout | Container;

    private readonly viewSize: Point;
    private mask?: Container | NineSlicePlane;

    constructor(viewSize: Point, content: Container, layout: ILayout | Container) {

        this.viewSize = viewSize;
        this.child = layout;

        this.mask = DefaultSkin.makeFrame(viewSize.x, viewSize.y);
        if (this.mask) {

        }
    }

    public layout(rect: Rectangle, parent?: Container<DisplayObject>): IDisplay {

        if (isLayout(this.child)) {

            return this.child.layout(new Rectangle(rect.x, rect.y + this._scroll, rect.width, rect.height), parent);

        } else {
            this.child.y = rect.y + this._scroll;
            return this.child;
        }

    }





}