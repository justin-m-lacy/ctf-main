import { InputParams, InputModifier, mapModifiers } from './definitions';


export class InputBinding<E extends Event = Event> {

    /**
     * Whether to prevent default behaviors on this binding.
     * preventDefault does not affect input binding equality tests.
     * @default true
     */
    readonly preventDefault: boolean = true;

    readonly type: E['type'];

    /**
     * Value of input that matches.
     */
    readonly value: string | number;

    private modifiers: InputModifier = 0;

    /**
     * cached string encoding.
     */
    private _encode: string = '';

    constructor(input: InputParams<E> | string) {

        if (typeof input === 'string') {

            const parts = input.split(':');

            if (parts.length <= 0) {
                throw new Error(`InputBinding(): invalid encoding: ${input}`);
            }

            this.type = parts[0];
            if (parts.length > 1) {

                const v = parseInt(parts[1]);
                this.value = isNaN(v) ? parts[1] : v;
                if (parts.length > 2) {
                    this.modifiers = parseInt(parts[2]);
                }

            } else {
                this.value = 0;
            }



        } else {

            this.type = input.type ?? 'any';

            this.value = input.key ?? input.button ?? input.touchCount ?? 0;
            this.modifiers = mapModifiers(input);

        }

        this._encode = this.toEncoding();

    }

    encoding() {
        if (this._encode === '') {
            this._encode = this.toEncoding();
        }
        return this._encode;
    }

    toString() {

        let res: string = '';

        switch (this.type) {

            case 'mousedown':
            case 'pointerdown':
                if (this.value === 2) res = 'Right Click';
                else if (this.value === 1) res = 'Center Click';
                else res = 'Click'
                break;
            case 'keydown':
                res = (this.value as string).toUpperCase();
                break;
            case 'touchstart':
                res = 'Touch';
                break;
            default:
                res = this.type;

        }

        if (this.modifiers & InputModifier.Ctrl) {
            res = 'Ctrl-' + res;
        }
        if (this.modifiers & InputModifier.Alt) {
            res = 'Alt-' + res;
        }
        if (this.modifiers & InputModifier.Shift) {
            res = 'Shift-' + res;
        }

        return res;

    }

    toEncoding() {
        return `${this.type}:${this.value}:${this.modifiers}`;
    }

    equals(input: InputBinding<E>) {
        return input._encode === this._encode;
    }

}


/**
 * Links a command to all its input bindings.
 */
export class CommandBindings<CType = any, DType = any> {


    readonly command: CType;

    /**
     * list of inputs that trigger command.
     */
    readonly bindings: (InputBinding | undefined)[] = [];

    /**
     * Input group of command. Commands in different
     * input groups can overlap.
     */
    readonly group: string;

    /**
     * Optional data to include with this command.
     */
    data?: DType;

    constructor(command: CType, group: string, inputs?: InputBinding[] | InputBinding) {

        this.command = command;

        this.group = group;

        if (inputs instanceof Array) {
            Array.prototype.push.apply(this.bindings, inputs);
        } else if (inputs) {
            this.bindings.push(inputs);
        }

    }

    /**
     * Find input matching encoding.
     * @param encoding 
     */
    public findInput(encoding: string) {
        return this.bindings.find(v => v && v.encoding() === encoding);
    }

    /**
     * Remove matching input.
     * @param input 
     */
    public remove(input: InputBinding) {

        for (let i = this.bindings.length - 1; i >= 0; i--) {
            if (this.bindings[i]?.equals(input)) {
                this.bindings[i] = undefined;
            }
        }
    }

    public setBinding(input: InputBinding, ind: number | null = null) {

        if (ind === null || ind < 0) {
            this.bindings.push(input);
        } else {

            if (ind >= this.bindings.length) {
                this.bindings.length = ind + 1;
            }
            this.bindings[ind] = input;
        }

    }

    public getBinding(ind: number | null) {
        if (ind !== null && ind >= 0 && ind < this.bindings.length) {
            return this.bindings[ind];
        }
        return undefined;
    }

    public clear() {
        this.bindings.length = 0;
    }

    public add(input?: InputBinding) {

        if (input) {
            /// Prevent duplicate inputs.
            if (!this.bindings.find(v => v?.equals(input))) {
                this.bindings.push(input);
            }
        } else {
            /// Only allowed to preserve user binding indices.
            this.bindings.push(undefined);
        }
    }

}

/*const getKeyString = (key: string | number) => {

    const code = typeof key === 'string' ? key.charCodeAt(0) : key;
    return (codeToString[code] ?? key.toString()).toUpperCase();

}

const codeToString: { [key: number]: string } = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    27: 'Escape',
    32: 'Space',
    36: 'Home',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    192: '`',
    222: "'"
}*/