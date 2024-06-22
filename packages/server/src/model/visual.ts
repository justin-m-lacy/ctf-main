import { IRectangle, IPoint, Point, Rectangle } from '../engine/data/geom';
import Container from '../engine/data/container';


export default class Visual implements IBody {

    private readonly _position: Point = new Point();
    private readonly _scale: Point = new Point(1, 1);

    private _rotation: number = 0;

    name?: string;

    get position(): IPoint { return this._position; }
    set position(v: IPoint) { this._position.set(v.x, v.y); }

    get x(): number { return this._position.x; }
    set x(x: number) { this._position.x = x; }

    get y(): number { return this._position.y; }
    set y(y: number) { this._position.y = y; }

    get rotation(): number { return this._rotation; }
    set rotation(v: number) {
        while (v > Math.PI) v -= 2 * Math.PI;
        while (v < -Math.PI) v += 2 * Math.PI;
        this._rotation = v;
    }

    get scale(): IPoint {
        return this._scale;
    }
    set scale(value: IPoint) {
        this._scale.x = value.x;
        this._scale.y = value.y;
    }
    bounds: IRectangle = new Rectangle();
    parent?: Container;

    constructor() {
    }


    getBounds(rect?: IRectangle): IRectangle {
        return this.bounds;
    }
    getLocalBounds(rect?: IRectangle): IRectangle {
        throw new Error('Method not implemented.');
    }
    toGlobal<P extends IPoint = Point>(position: IPoint, point?: P, skipUpdate?: boolean): P {
        throw new Error('Method not implemented.');
    }
    toLocal<P extends IPoint = Point>(position: IPoint, from?: IBody, point?: P, skipUpdate?: boolean): P {
        throw new Error('Method not implemented.');
    }
    setParent(container: Container): Visual {
        return container.addChild(this);
    }

}

export interface IBody {

    get position(): IPoint;
    set position(v: IPoint);

    get x(): number;
    set x(v: number);

    get y(): number;
    set y(v: number);

    get rotation(): number;
    set rotation(v: number);

    get scale(): IPoint;
    set scale(value: IPoint);

    bounds: IRectangle;

    parent?: Container;

    getBounds(rect?: IRectangle): IRectangle;

    /**
     * Local bounds of the body as a rectangle object.
     *
     * @param {IRectangle} [rect] - Optional rectangle to store the result of the bounds calculation.
     * @return {IRectangle} The rectangular bounding area.
     */
    getLocalBounds(rect?: IRectangle): IRectangle;

    toGlobal<P extends IPoint = Point>(position: IPoint, point?: P, skipUpdate?: boolean): P;
    /**
     * Calculates the local position of the display object relative to another point.
     *
     * @param {PIXI.IPointData} position - The world origin to calculate from.
     * @param {PIXI.Body} [from] - The Body to calculate the global position from.
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional
     *  (otherwise will create a new Point).
     * @param {boolean} [skipUpdate=false] - Should we skip the update transform
     * @return {PIXI.Point} A point object representing the position of this object
     */
    toLocal<P extends IPoint = Point>(position: IPoint, from?: IBody, point?: P, skipUpdate?: boolean): P;

}