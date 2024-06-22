
import { IDisplay, ILayout, isLayout } from './layout';
import { Rectangle, Container } from 'pixi.js';


export class BoundedBox implements ILayout {

    private readonly bounds: { minWidth?: number, maxWidth?: number, minHeight?: number, maxHeight?: number };

    private readonly child: ILayout | Container;

    constructor(bounds: { minWidth?: number, maxWidth?: number, minHeight?: number, maxHeight?: number }, child: ILayout | Container) {

        this.bounds = bounds;
        this.child = child;

    }

    public layout(rect: Rectangle, parent?: Container): IDisplay {

        if (isLayout(this.child)) {

            let width = rect.width, height = rect.height;
            if (this.bounds.minWidth && width < this.bounds.minWidth) {
                width = this.bounds.minWidth;
            }
            if (this.bounds.maxWidth && width > this.bounds.maxWidth) {
                width = this.bounds.maxWidth;
            }

            if (this.bounds.minHeight && height < this.bounds.minHeight) {
                height = this.bounds.minHeight;
            }
            if (this.bounds.maxHeight && width > this.bounds.maxHeight) {
                height = this.bounds.maxHeight;
            }

            return this.child.layout(

                new Rectangle(rect.x, rect.y, width, height)
                , parent);

        } else {

            if (this.bounds.minWidth && this.child.width < this.bounds.minWidth) {
                this.child.width = this.bounds.minWidth;
            }
            if (this.bounds.maxWidth && this.child.width > this.bounds.maxWidth) {
                this.child.width = this.bounds.maxWidth;
            }

            if (this.bounds.minHeight && this.child.height < this.bounds.minHeight) {
                this.child.height = this.bounds.minHeight;
            }
            if (this.bounds.maxHeight && this.child.height > this.bounds.maxHeight) {
                this.child.height = this.bounds.maxHeight;
            }

            return this.child;

        }

    }

}