import { Group } from 'gibbon.js';
import { Container, FederatedPointerEvent } from 'pixi.js';

interface TDisplay {

    x: number,
    y: number,
    width: number, height: number, visible: boolean,
    destroyed?: boolean,
    isDestroyed?: boolean
};

export type RollOverParams<T extends any> = {

    /**
     * Object that triggers the rollover.
     */
    target: Container,

    /**
     * Optional container to position the popup around.
     */
    avoid?: Container,
    data: T,
    popup?: TDisplay,
    onOver?: (params: RollOverParams<T>) => void,
    onOut?: (params: RollOverParams<T>) => void

}

export class RollOverGroup extends Group {

    //private readonly rollovers: RollOverParams<any>[] = [];

    private rollovers: Map<Container, RollOverParams<any>> = new Map();

    private curOver: RollOverParams<any> | null = null;
    private curPopup: TDisplay | null = null;

    private useTouch: boolean = false;
    private usePointer: boolean = false;

    onAdded() {

        const events = this.game!.app.renderer.events!;

        this.useTouch = events.supportsTouchEvents;
        this.usePointer = events.supportsPointerEvents;

        for (const r of this.rollovers.values()) {
            this.listen(r);
        }
    }

    onRemoved() {

        for (const r of this.rollovers.values()) {
            this.endListen(r);
        }
        this.hideCurrent();
    }

    public addRollOver<T>(params: RollOverParams<T>) {

        this.removeRollOver(params.target);

        this.rollovers.set(params.target, params);
        if (this.game) {
            this.listen(params);
        }

    }

    public removeRollOver(target: Container) {

        const params = this.rollovers.get(target);
        if (params) {
            this.rollovers.delete(target);
            this.endListen(params);
        }

    }

    private listen<T>(params: RollOverParams<T>) {

        const targ = params.target;

        targ.interactive = true;
        if (this.usePointer) {
            targ.on('pointerover', this.onRollOver, this);
            targ.on('pointerout', this.onRollOut, this);
        }
        if (this.useTouch) {
            targ.on('touchstart', this.onRollOver, this);
            targ.on('touchend', this.onRollOut, this);
        }

    }

    private endListen<T>(params: RollOverParams<T>) {
        const targ = params.target;

        if (this.usePointer) {
            targ.off('pointerover', this.onRollOver, this);
            targ.off('pointerout', this.onRollOut, this);
        }
        if (this.useTouch) {
            targ.off('touchstart', this.onRollOver, this);
            targ.off('touchend', this.onRollOut, this);
        }
    }

    private onRollOver(evt: FederatedPointerEvent) {

        const targ = evt.target;

        if (targ instanceof Container) {
            const which = this.rollovers.get(targ);
            if (which) {
                this.showPopup(which);
            }
        }

    }

    private onRollOut(evt: FederatedPointerEvent) {

        if (this.curOver?.target === evt.currentTarget) {
            this.hideCurrent();
        }

    }

    private showPopup(params: RollOverParams<any>) {

        this.hideCurrent();

        this.curOver = params;
        if (params.popup) {
            this.curPopup = params.popup;
            this.position(params.avoid ?? params.target, params.popup);
            params.popup.visible = true;

        }
        params.onOver?.(params);

    }

    private hideCurrent() {
        if (this.curPopup && !this.curPopup.destroyed && !this.curPopup.isDestroyed) {
            this.curPopup.visible = false;
            this.curPopup = null;
        }
        if (this.curOver) {
            this.curOver.onOut?.(this.curOver);
            this.curOver = null;
        }
    }

    private position(targ: Container, popup: TDisplay) {

        const padding = 40;
        const rect = this.game!.screen;

        /// pick side with more space.
        if (targ.x - rect.left >= rect.right - (targ.x + targ.width)) {


            popup.x = targ.x - popup.width - padding;
            if (popup.x < padding) {

                popup.x = padding;
            }

        } else {

            popup.x = targ.x + targ.width + padding;
            if (popup.x + padding > rect.right) {
                popup.x = rect.right - popup.width - padding;
            }

        }

        if (targ.y - rect.y > rect.bottom - (targ.y + targ.height)) {

            popup.y = targ.y - popup.height - padding;
            if (popup.y < padding) {
                popup.y = padding;
            }

        } else {
            popup.y = targ.y + targ.height + padding;
            if (popup.y + padding > rect.bottom) {
                popup.y = rect.bottom - popup.height - padding;
            }

        }

    }

    onDestroy() {

        this.rollovers.clear();
        this.curPopup = null;
        this.curOver = null;

        super.onDestroy?.();

    }

}