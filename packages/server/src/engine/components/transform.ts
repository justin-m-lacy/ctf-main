import { Component } from "../component";
import { Point } from "../data/geom";
import { quickSplice } from "../utils/array-utils";
import { Constructor } from "../utils/types";
import { EngineEvent } from '../actor';

export class Transform extends Component {

    private _rotation: number = 0;

    name?: string;

    get x(): number { return this.position.x; }
    set x(x: number) { this.position.x = x; }

    get y(): number { return this.position.y; }
    set y(y: number) { this.position.y = y; }

    get rotation(): number { return this._rotation; }
    set rotation(v: number) {
        this._rotation = v % (2 * Math.PI);
    }

    get size() { return this._size; }

    get width() { return this._size.x }
    set width(v) { this._size.x = v; }

    get height() { return this._size.y }
    set height(v) { this._size.y = v; }

    private _size = new Point(0, 0);

    private _parent?: Transform;
    public get parent() { return this._parent; }

    private readonly _children: Transform[] = [];
    public get children() { return this._children.values() }
    [Symbol.iterator]() { return this._children.values(); }

    /**
     * Find all children with component type.
     * @param {*} cls
     * @param results - Optional array to place results in.
     */
    findInChildren<T extends Component>(cls: Constructor<T>, results: Array<T> = []) {

        for (let i = this._children.length - 1; i >= 0; i--) {
            const comp = this._children[i].get(cls);
            if (comp) {
                results.push(comp);
            }
        }
        return results;

    }

    /**
     * Find components recursively in all children.
     * This is an expensive operation.
     * @param cls 
     */
    findRecursive<T extends Component>(cls: Constructor<T>, results: Array<T> = []) {

        for (let i = this._children.length - 1; i >= 0; i--) {
            const child = this._children[i];
            const comp = child.get(cls);
            if (comp) {
                results.push(comp);
            }
            child.findRecursive(cls, results);
        }
        return results;

    }

    /**
     *
     * @param {number} x
     * @param {number} y
     */
    translate(x: number, y: number) {
        this.position.x += x;
        this.position.y += y;
    }

    addChild(t: Transform) {

        if (t === this) {
            console.log(`Attempt to set self as parent failed.`);
        } else if (t !== this && t._parent != this) {

            const oldParent = t._parent;
            t._parent = this;

            oldParent?.removeChild(t);

            this._children.push(t);

            this.actor?.emit(EngineEvent.ChildAdded, t);

        }

    }

    /**
     *
     * @param t - Child transform to remove.
     * The child will be added to the root actor's children.
     * A transform cannot be removed from root.
     * To do this, add it to another transform's children instead.
     * @returns 
     */
    removeChild(t: Transform) {

        const ind = this._children.indexOf(t);
        if (ind >= 0) {
            quickSplice(this._children, ind);
        }
        this.actor?.emit(EngineEvent.ChildRemoved, t);

        if (t._parent == this) {
            t._parent = undefined;
        }
    }

}