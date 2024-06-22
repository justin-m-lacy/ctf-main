import { InputBinding, CommandBindings } from './bindings';
import { eventToKey, InputParams } from './definitions';
import EventEmitter from 'eventemitter3';

type InputEncoding = string;

type InputMapEvents<CType> = {
    bindInput: (binding: InputBinding, index: number | null) => void,
    unbindInput: (cmd: CType, binding: InputBinding) => void,
}
/**
 * Map between raw inputs and commands.
 * @param CType - Command Type.
 */
export class InputMap<
    CType,
    T extends string,
    EventTypes extends Event>
    extends EventEmitter<InputMapEvents<CType>> {

    static readonly DefaultGroup = 'default';

    static readonly EventBindInput = 'bindInput';
    static readonly EventUnbindInput = 'unbindInput';

    public get encodings() { return this.encodingMap.values(); }

    /**
     * Maps command type to Command object.
     */
    public readonly bindings: Map<CType, CommandBindings<CType>> = new Map();

    /**
     * Maps string encoding of an input binding to Command triggered.
     */
    private readonly encodingMap: Map<InputEncoding, CommandBindings<CType>> = new Map();


    private inputToKey: (evt: InputParams<EventTypes>) => InputEncoding = eventToKey;

    /**
     * Get bindings for a command.
     * @param type 
     * @returns 
     */
    public getBindings(type: CType) { return this.bindings.get(type); }

    /**
     * Get command associated with key-encoded input.
     * @param key 
     * @returns 
     */
    public getKeyedCommand(key: string) {
        return this.encodingMap.get(key)?.command;
    }

    /**
     * Get the command associated with the DOM user input.
     * @param evt 
     */
    public mapCommand(evt: EventTypes) {
        return this.encodingMap.get(this.inputToKey(evt))?.command;
    }

    /**
     * Clear any command associated with input.
     * @param input 
     */
    //public clearInput(input: InputBinding) {
    //}

    /**
     * Restore binding from encoded string.
     * @param cmd 
     * @param encodings
     */
    public restoreBinding(cmd: CType, encodings: string[]) {

        this.clearCommand(cmd);
        const bindingSet = this.requireBindings(cmd);

        for (let i = 0; i < encodings.length; i++) {

            const encoding = encodings[i];
            if (encoding != null && encoding.length > 0) {

                try {

                    /// Remove any current encoding of binding.
                    this.removeEncoding(encoding);

                    const input = new InputBinding(encoding);
                    bindingSet.setBinding(input)
                    this.encodingMap.set(encoding, bindingSet);

                } catch (err) {
                    console.warn(err);
                }

            }
        }

    }

    public addCommand(cmd: CType, ...inputs: InputParams<EventTypes>[]) {

        let binding = this.bindings.get(cmd);
        if (!binding) {
            binding = new CommandBindings(cmd, InputMap.DefaultGroup);
            this.bindings.set(cmd, binding);
        }
        for (let i = 0; i < inputs.length; i++) {
            this.bindCommand(cmd, inputs[i]);
        }

        return binding;

    }

    /**
     * Get or create bindings for command.
     * @param cmd 
     * @returns 
     */
    private requireBindings(cmd: CType, group: string = InputMap.DefaultGroup) {

        let bindSet = this.bindings.get(cmd);
        if (bindSet) return bindSet;

        bindSet = new CommandBindings(cmd, group);
        this.bindings.set(cmd, bindSet);

        return bindSet;

    }

    /**
     * Replace command binding at index.
     * @param cmd 
     * @param input 
     * @param index 
     */
    public bindCommand(cmd: CType, input: InputParams<EventTypes>, index: number | null = null) {

        const binding = new InputBinding(input);
        const encoding = binding.encoding();

        console.log(`setting cmd bind: ${cmd}:: '${encoding}'`);

        /// Removing any current binding for new input.
        this.removeEncoding(encoding);

        const bindSet = this.requireBindings(cmd);
        if (index !== null) {
            // if index is set, undo the current binding at that index.
            const cur = bindSet.getBinding(index);
            if (cur) this.removeEncoding(cur.encoding());
        }

        bindSet.setBinding(binding, index);

        /// Map input encoding to the correct binding set.
        this.encodingMap.set(encoding, bindSet);

        this.emit(InputMap.EventBindInput, binding, index);

        return binding;
    }

    private removeEncoding(encoding: string) {

        const set = this.encodingMap.get(encoding);
        if (set) {
            const input = set.findInput(encoding);
            if (input) {
                this.removeBinding(input);
            } else {
                /// even if binding missing, remove encoding from map.
                this.encodingMap.delete(encoding);
            }
        }

    }

    /**
     * Remove input binding currently associated with encoding.
     * @param encoding 
     */
    private removeBinding(input: InputBinding,) {

        const encoding = input.encoding();
        const set = this.encodingMap.get(encoding);
        if (set) {

            set.remove(input);
            this.encodingMap.delete(encoding);

            this.emit(InputMap.EventUnbindInput, set.command, input);

        }

    }


    /**
     * Remove all current bindings for command.
     * @param binding 
     */
    private clearCommand(cmd: CType) {

        const binding = this.bindings.get(cmd);
        if (binding) {

            const inputs = binding.bindings;
            for (let i = inputs.length - 1; i >= 0; i--) {
                const input = inputs[i];
                if (input) {
                    this.removeBinding(input);
                }
            }

            binding.clear();
        }

    }

    /**
     * Clear bindings for a command and remove the command.
     * @param cmd 
     */
    public removeCommand(cmd: CType) {

        this.clearCommand(cmd);
        this.bindings.delete(cmd);
    }

}
