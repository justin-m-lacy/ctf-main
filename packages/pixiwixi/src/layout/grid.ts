import { Container, DisplayObject, Rectangle } from 'pixi.js';

import { IDisplay, ILayout, Positionable, isLayout, NoDisplay } from './layout';


export class GridLayout implements ILayout {


    private readonly cols: number;
    private rowGap: number;
    private colGap: number;

    private rowHeight?: number;

    //private rows: number;
    private items: (ILayout | Container)[];

    /**
     * 
     * @param params.items - items being displayed.
     * @param params.cols - number of columns in grid.
     * @param params.rowGap - space between each row.
     * @param params.colGap - space between each column.
     */
    constructor(params: {
        items: (ILayout | Container)[]

        cols: number,
        rowGap?: number,
        colGap?: number,
        rowHeight?: number
    }) {

        this.items = params.items;

        //this.rows = params.rows ?? 0;
        this.cols = params.cols;
        if (this.cols <= 0) {
            this.cols = 1;
        }

        this.rowHeight = params.rowHeight;

        this.rowGap = params.rowGap ?? 0;
        this.colGap = params.colGap ?? 0;

    }

    public layout(rect: Rectangle, parent?: Container<DisplayObject>): IDisplay {

        const len = this.items.length;
        if (len === 0) {
            return NoDisplay();
        }

        const displays: IDisplay[] = [];

        const rows = Math.ceil(len / this.cols);

        const colWidth: number = (rect.width - (this.cols - 1) * this.colGap) / (this.cols);
        const rowHeight = this.rowHeight ?? (rect.height - this.rowGap * (rows - 1)) / rows;
        const cell = new Rectangle(rect.x, rect.y, colWidth, rowHeight);

        let col: number = 0;
        let display: IDisplay;
        for (let i = 0; i < len; i++) {


            const child = this.items[i];
            if (isLayout(child)) {

                display = child.layout(cell, parent);
                if (display instanceof DisplayObject) {
                    parent?.addChild(display);
                }
            } else {

                display = child;
                child.width = cell.width;
                child.height = cell.height;
                display.x = cell.x;
                display.y = cell.y;

                parent?.addChild(child);

            }
            if (display.visible) {
                continue;
            }


            displays.push(display);
            if (++col < this.cols) {
                cell.x += colWidth + this.colGap;
            } else {
                col = 0;
                cell.x = rect.x;
                cell.y += rowHeight + this.rowGap;
            }

        }

        return new Positionable(displays, rect);

    }


}