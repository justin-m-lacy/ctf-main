import { InputGroup } from '../groups/input-group';
import { CommandKey } from './commands';

/**
 * Listens for all input to rebind a command.
 */
export class RebindListener {

    private _mouseDownListener?: (e: MouseEvent) => void;
    private _keyDownListener?: (e: KeyboardEvent) => void;
    private _touchListener?: (e: TouchEvent) => void;

    private hasKeyboard: boolean = true;
    private hasPointer: boolean = true;
    private hasTouch: boolean = false;

    private listening: boolean = false;

    /**
     * 
     */
    private input: InputGroup;

    /**
     * Command being rebound.
     */
    private command?: CommandKey;

    /**
     * Index of binding set to rebind.
     */
    private index: number = 0;

    constructor(
        group: InputGroup,
    ) {

        this.input = group;
        this.hasKeyboard = group.supportsKeyboard;
        this.hasPointer = group.supportsPointer;

        this.hasTouch = group.supportsTouch;

    }


    public beginRebind(command: CommandKey, index: number = 0) {

        /// disable primary input.
        this.input.disable();

        this.index = index;

        this.command = command;

        if (this.hasPointer) {
            this._mouseDownListener = this._mouseDownListener ?? ((e: MouseEvent) => this.onMouseDown(e));
            document.addEventListener('mousedown', this._mouseDownListener);
        }

        if (this.hasKeyboard) {

            this._keyDownListener = this._keyDownListener ?? ((e: KeyboardEvent) => this.onKeyDown(e));
            document.addEventListener('keydown', this._keyDownListener);
        }

        if (this.hasTouch) {

            this._touchListener = this._touchListener ?? ((e: TouchEvent) => this.onTouchStart(e));
            document.addEventListener('touchstart', this._touchListener);
        }

        /// Only start listening here, otherwise the initial mouse event will be used.
        this.listening = true;

    }

    private endRebind() {

        this.input.enable();
        this.endListen();

    }

    public endListen() {


        if (this.hasPointer && this._mouseDownListener) {
            document.removeEventListener('mousedown', this._mouseDownListener);
        }
        if (this.hasKeyboard && this._keyDownListener) {
            document.removeEventListener('keydown', this._keyDownListener);
        }
        if (this.hasTouch && this._touchListener) {
            document.removeEventListener('touchstart', this._touchListener);
        }

        this.listening = false;
    }

    private onTouchStart(e: TouchEvent): void {

        if (!this.listening) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (this.command) {
            this.input.rebindCommand(this.command, {
                type: e.type,
                touchCount: e.touches.length,
                touches: e.touches,
                shiftKey: e.shiftKey ?? undefined,
                ctrlKey: e.ctrlKey ?? undefined,
                altKey: e.altKey ?? undefined,
                metaKey: e.metaKey ?? undefined,
            }, this.index);
        }

        this.endRebind();

    }

    private onMouseDown(e: MouseEvent): void {

        if (!this.listening) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (this.command) {
            this.input.rebindCommand(this.command, {

                type: e.type,
                button: e.button,
                buttons: e.buttons,
                shiftKey: e.shiftKey ?? undefined,
                ctrlKey: e.ctrlKey ?? undefined,
                altKey: e.altKey ?? undefined,
                metaKey: e.metaKey ?? undefined,
            }, this.index);
        }

        this.endRebind();

    }

    private onKeyDown(e: KeyboardEvent): void {

        if (!this.listening) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (this.command) {
            this.input.rebindCommand(this.command, {
                type: e.type,
                key: e.key,
                shiftKey: e.shiftKey ?? undefined,
                ctrlKey: e.ctrlKey ?? undefined,
                altKey: e.altKey ?? undefined,
                metaKey: e.metaKey ?? undefined,

            }, this.index);
        }

        this.endRebind();
    }

    public destroy() {
        this.endListen();
    }

}