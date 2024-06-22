import { ILayout, IDisplay, isLayout } from './layout';
import { Container, Rectangle } from 'pixi.js';

export abstract class ChildLayout implements ILayout {

    readonly child: ILayout | Container;
    constructor(child: ILayout | Container) {
        this.child = child;
    }
    public layout(rect: Rectangle, parent?: Container): IDisplay {

        const child = isLayout(this.child) ? this.child.layout(rect, parent) : this.child;
        return this.onLayout?.(rect,
            child, parent
        ) ?? child;

    }

    abstract onLayout(rect: Rectangle, child: IDisplay, parent?: Container): IDisplay;

}