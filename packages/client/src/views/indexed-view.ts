import { View } from './view';
import { Container } from 'pixi.js';
import { PaneOptions } from './pane';
import { ChildLayout } from '../layout/layout';

export class IndexedView extends View {

    private views: Container[];

    public get curIndex() { return this.index }
    public set curIndex(v) {

        this.index = v;
        for (let i = this.views.length - 1; i >= 0; i--) {
            if (i === v) {
                this.views[i].visible = true;
            } else {
                this.views[i].visible = false;
            }
        }
        if (this._childLayout) {
            this._childLayout.child = this.views[v];
        }

    }

    private index: number = 0;

    private _childLayout?: ChildLayout;

    constructor(views: Container[], opts?: PaneOptions) {

        super(opts);

        this.views = views;

    }

    /**
     * Only accept layout with a settable child.
     * @param layout 
     */
    public setLayout(layout?: ChildLayout): void {

        this._childLayout = layout;
        if (layout) {
            layout.child = this.views[this.curIndex];
        }

        super.setLayout(layout);

    }

}