import { PaneOptions } from './pane';
import { Container } from 'pixi.js';
import { IndexedView } from './indexed-view';
import { ILayout } from '../layout/layout';
import { ViewControl } from './view-control';

export type TabViewOptions = PaneOptions & {
    tabs?: Container[],
    view?: IndexedView,
    views?: Container[]
}
export class TabView extends ViewControl implements ILayout {

    private tabs: Container[] = [];

    private myView: IndexedView;

    public get curIndex() { return this.myView.curIndex }
    public set curIndex(v) {
        this.myView.curIndex = v;
        this.layout();
    }

    private _listening: boolean = false;

    constructor(opts: TabViewOptions) {

        super(Object.assign({ view: opts?.view ?? new IndexedView(opts.views!) }, opts));

        if (!opts.view && !opts.views) {
            throw new Error('View or Views must be provided to TabView');
        }
        // @ts-ignore
        this.myView = this.view as IndexedView;

    }

    private listenTabs() {

        if (!this._listening) {

            this._listening = true;
            for (let i = this.tabs.length - 1; i >= 0; i--) {

                const tab = this.tabs[i];
                tab.on('pointerdown', () => this.tabSelected(i), this);


            }
        }

    }

    onEnable() {
        super.onEnable();
        this.listenTabs();
    }

    onDisable() {
        super.onDisable();
        this.stopListen();
    }

    private tabSelected(ind: number) {
        this.curIndex = ind;
    }

    private stopListen() {

        if (this._listening) {
            for (let i = this.tabs.length - 1; i >= 0; i--) {
                this.tabs[i].removeAllListeners('pointerdown');
            }
            this._listening = false;
        }

    }

}