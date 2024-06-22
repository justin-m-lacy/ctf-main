import { Pane, PaneOptions } from '../pane';
import { Container, Point, EventSystem, FederatedEvent, DisplayObject, FederatedPointerEvent } from 'pixi.js';
import { Axis } from '../../layout/layout';

export type SliderOpts = PaneOptions & {
    thumb?: Container,
    track?: Container,
    axis?: Axis

}
export class Slider extends Pane {

    static ValueChanged = 'changed';

    public get range() {
        return this.valueRange;
    }
    public set range(v) {
        this.valueRange.min = v.min;
        this.valueRange.max = v.max;
    }


    private valueRange = {
        min: 0, max: 1
    };

    /**
     * Range of slider coordinate, along the slider axis.
     */
    private coordRange = {
        min: 0,
        max: 100
    };

    /**
     * Slider thumb.
     */
    private thumb: DisplayObject;

    private track?: DisplayObject;

    /**
     * Listening to slider events.
     */
    private listening: boolean = false;

    /**
     * Thumb being dragged.
     */
    private dragging: boolean = false;

    private axis: Axis;

    private dragPoint: Point = new Point();

    public constructor(opts?: SliderOpts,) {

        super(opts);

        this.coordRange.max = this.width;

        this.thumb = opts?.thumb ?? new Container();
        this.track = opts?.track;

        this.axis = opts?.axis ?? Axis.Horizontal;

    }

    private onDrag(event: FederatedEvent) {
        this.updateValue(event);
    }

    private updateValue(event: FederatedEvent) {

        event.data.getLocalPosition(this, this.dragPoint);

        let axisCoord = this.axis === Axis.Horizontal ? this.dragPoint.x : this.dragPoint.y;
        axisCoord -= this.coordRange.min;

        if (axisCoord < 0) {
            axisCoord = 0;
        } else if (axisCoord > this.coordRange.max) {
            axisCoord = this.coordRange.max;
        }

        if (this.axis === Axis.Horizontal) {
            this.thumb?.position.set(axisCoord, this.thumb.y);
        } else {
            this.thumb?.position.set(this.thumb.x, axisCoord);
        }

        const value = axisCoord / (this.coordRange.max - this.coordRange.min);
        this.emit(Slider.ValueChanged, value);


    }

    private startDrag(event: FederatedPointerEvent) {

        event.getLocalPosition(this, this.dragPoint);

        this.dragging = true;

        this.thumb.on('pointermove', this.onDrag, this);


    }

    private endDrag(event: FederatedEvent) {

        this.emit(Slider.ValueChanged, this);
        this.stopDrag();


    }

    private stopDrag() {
        this.dragging = false;
        this.thumb.off('pointermove', this.onDrag, this);
    }


    private listen() {

        if (this.listening) {
            return;
        }
        this.listening = true;

        this.thumb.on('pointerdown', this.startDrag, this);
        this.thumb.on('pointerup', this.endDrag, this);
        this.thumb.on('pointerupoutside', this.endDrag, this);


    }



    private endListen() {

        if (this.dragging) {
            this.stopDrag();
        }
        this.thumb.off('pointerdown', this.startDrag, this);
        this.thumb.off('pointerup', this.endDrag, this);
        this.thumb.off('pointerupoutside', this.endDrag, this);
        this.thumb.off('pointermove', this.endDrag, this);

        this.listening = false;

    }



}