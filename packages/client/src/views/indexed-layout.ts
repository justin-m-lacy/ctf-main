import { Container, DisplayObject } from 'pixi.js';
import { Rectangle } from 'pixi.js';
import { IDisplay, ILayout, isLayout } from '../layout/layout';

/**
 * Display view based on index.
 */
export class IndexedLayout implements ILayout {

    public get curIndex() { return this.index }
    public set curIndex(v) {
        this.index = v;
    }

    /**
     * Currently displayed index.
     */
    private index: number = 0;

    private readonly views: (ILayout | Container)[] = [];

    constructor(views: (ILayout | Container)[], index: number = 0) {

        this.views = views;
        this.index = index;

    }

    public layout(rect: Rectangle, parent?: Container<DisplayObject>): IDisplay {

        const cur = this.views[this.index];

        if (isLayout(cur)) {

            return cur.layout(rect, parent);

        } else {

            cur.position.set(rect.x, rect.y);

            return cur;

        }

    }



}