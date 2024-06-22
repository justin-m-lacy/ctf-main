import Visual, { IBody } from '../../model/visual';
import { IRectangle } from './geom';

export default class Container extends Visual implements IContainer {

    readonly children: Visual[] = [];

    public addChild<T extends Visual[]>(...children: T): T[0] {

        for (let i = children.length - 1; i >= 0; i--) {
            children[i].parent = this;
        }

        this.children.push.apply(this, children);
        return children[0];
    }

    public addChildAt<T extends Visual>(child: T, index: number): T {
        this.children.splice(index, 0, child);
        child.parent = this;
        return child;
    }
    public swapChildren(child1: Visual, child2: Visual): void {

        const index1 = this.children.indexOf(child1);
        if (index1 >= 0) {

            const index2 = this.children.indexOf(child2);
            if (index2 >= 0) {

                this.children[index1] = child2;
                this.children[index2] = child1;


            }

        }
    }
    public getChildIndex(child: Visual): number {
        return this.children.indexOf(child);
    }
    public setChildIndex(child: Visual, index: number): void {
        throw new Error('Method not implemented.');
    }
    public getChildAt(index: number): Visual {
        return this.children[index];
    }
    public removeChild<T extends Visual[]>(...children: T): T[0] {

        for (let i = children.length - 1; i >= 0; i--) {



        }

        return children[0];

    }
    public removeChildAt(index: number): Visual {
        throw new Error('Method not implemented.');
    }
    public removeChildren(beginIndex?: number, endIndex?: number): Visual[] {
        throw new Error('Method not implemented.');
    }

    public calculateBounds(): void {
        throw new Error('Method not implemented.');
    }
    public destroy(children?: boolean): void {

        /*if (children) {

            for (let i = this.children.length - 1; i >= 0; i--) {
                this.children[i].destroy();
            }
        }*/
        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].parent = undefined;
        }

    }
    public get width(): number {
        return this.bounds.width;
    }
    public set width(value: number) {
        this.bounds.width = value;
    }
    public get height(): number {
        return this.bounds.height;
    }
    public set height(value: number) {
        this.bounds.height = value;
    }


}
export interface IContainer extends IBody {

    addChild<T extends Visual[]>(...children: T): T[0];

    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @param {Visual} child - The child to add
     * @param {number} index - The index to place the child in
     * @return {Visual} The child that was added.
     */
    addChildAt<T extends Visual>(child: T, index: number): T;
    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @param {Visual} child - First display object to swap
     * @param {Visual} child2 - Second display object to swap
     */
    swapChildren(child: Visual, child2: Visual): void;
    /**
     * Returns the index position of a child Body instance
     *
     * @param {Visual} child - The Body instance to identify
     * @return {number} The index position of the child display object to identify
     */
    getChildIndex(child: Visual): number;
    /**
     * Changes the position of an existing child in the display object container
     *
     * @param {Visual} child - The child Body instance for which you want to change the index number
     * @param {number} index - The resulting index number for the child display object
     */
    setChildIndex(child: Visual, index: number): void;
    /**
     * Returns the child at the specified index
     *
     * @param {number} index - The index to get the child at
     * @return {Visual} The child at the given index, if any.
     */
    getChildAt(index: number): Visual;
    /**
     * Removes one or more children from the container.
     *
     * @param {...Visual} children - The Body(s) to remove
     * @return {Visual} The first child that was removed.
     */
    removeChild<T extends Visual[]>(...children: T): T[0];
    /**
     * Removes a child from the specified index position.
     *
     * @param {number} index - The index to get the child from
     * @return {Visual} The child that was removed.
     */
    removeChildAt(index: number): Visual;
    /**
     * Removes all children from this container that are within the begin and end indexes.
     *
     * @param {number} [beginIndex=0] - The beginning position.
     * @param {number} [endIndex=this.children.length] - The ending position. Default value is size of the container.
     * @returns {Visual[]} List of removed children
     */
    removeChildren(beginIndex?: number, endIndex?: number): Visual[];

    /**
     * Recalculates the bounds of the container.
     *
     * This implementation will automatically fit the children's bounds into the calculation. Each child's bounds
     * is limited to its mask's bounds or filterArea, if any is applied.
     */
    calculateBounds(): void;
    /**
     * Retrieves the local bounds of the Body as a rectangle object.
     *
     * Calling `getLocalBounds` may invalidate the `_bounds` of the whole subtree below. If using it inside a render()
     * call, it is advised to call `getBounds()` immediately after to recalculate the world bounds of the subtree.
     *
     * @param {IRectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @param {boolean} [skipChildrenUpdate=false] - Setting to `true` will stop re-calculation of children transforms,
     *  it was default behaviour of pixi 4.0-5.2 and caused many problems to users.
     * @return {IRectangle} The rectangular bounding area.
     */
    getLocalBounds(rect?: IRectangle, skipChildrenUpdate?: boolean): IRectangle;

    destroy(children?: boolean): void;

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get width(): number;
    set width(value: number);
    /**
     * The height of the Container, setting this will actually modify the scale to achieve the value set
     *
     * @member {number}
     */
    get height(): number;
    set height(value: number);
}