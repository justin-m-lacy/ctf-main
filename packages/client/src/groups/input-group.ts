import { ClientGame } from '@/client-game';
import { Group } from 'gibbon.js';
import { CommandKey } from '../input/commands';
import { InputMap } from '../input/input-map';
import { EventSystem, DisplayObject, Point, FederatedPointerEvent, FederatedEvent } from 'pixi.js';
import { isKeyType, isMouseType } from '@/input/definitions';
import { TKeyEvents, TPointerEvents, isTouchType, InputParams } from '../input/definitions';
import { SavedBindings } from '../model/prefs';
import { useSettingsStore } from '@/store/settings';

export type PixiPointerEvent = FederatedPointerEvent | MouseEvent;

type EventNames = 'keydown' | 'mousedown' | 'touchstart' | 'pointerdown';
type EventTypes = KeyboardEvent | MouseEvent | TouchEvent;


export class InputGroup extends Group<ClientGame> {

    /**
     * Triggered when input is rebound.
     */
    static readonly EventBindInput = 'bindInput';
    static readonly EventRemoveBinding = 'bindRemove';

    private readonly inputMap: InputMap<CommandKey, EventNames, KeyboardEvent | MouseEvent | TouchEvent> = new InputMap();


    /// Events to listen for.
    private readonly listenEvents: string[] = ['keydown', 'pointerdown', 'touchstart'];

    /**
     * event listeners mapped by event type.
     */
    private readonly _keyListeners: Map<string, (evt: KeyboardEvent) => void> = new Map();

    private readonly _mouseListeners: Map<string, ((evt: PixiPointerEvent) => void) | ((evt: MouseEvent) => void)> = new Map();

    /**
     * True when listening for input.
     */
    get listening() { return this._listening; }
    private _listening: boolean = false;

    public get supportsKeyboard() {
        return true;
    }
    public get supportsPointer() {
        return EventSystem.defaultEventFeatures.click;
    }
    public get supportsTouch() {
        return EventSystem.defaultEventFeatures.click;
    }

    private readonly events: EventSystem;

    constructor(events: EventSystem) {

        super();

        this.events = events;

        this.initDefaults();

    }

    /**
     * Passthrough to underlying PIXI function.
     * This will return the local coordinates of the specified displayObject for this InteractionData
     * @param displayObject - The DisplayObject that you would like the local
     *  coords off
     * @param point - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param globalPos - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @returns - A point containing the coordinates of the InteractionData position relative
     *  to the DisplayObject
     */
    public getLocalPosition(display: DisplayObject, point?: Point, globalPos?: Point) {
        return this.events.pointer.getLocalPosition(display, point, globalPos);
    }
    public getBindings(cmd: CommandKey) {
        return this.inputMap.getBindings(cmd);
    }

    /**
     * Get key associated with a command, if any.
     * @param cmd 
     * @returns 
     */
    public getInputKey(cmd: CommandKey) {

        const bindings = this.inputMap.getBindings(cmd)?.bindings;
        if (bindings) {

            for (let i = 0; i <= bindings.length; i++) {

                const binding = bindings[i];
                if (binding?.type === 'keydown') {
                    return binding.value as string;
                }

            }

        }

    }

    public onAdded() {

        const bindings = useSettingsStore().getBindings();

        this.restoreBindings(bindings);

    }

    private restoreBindings(bindings: SavedBindings) {

        let cmd: keyof typeof bindings;
        for (cmd in bindings) {

            const encoding = bindings[cmd];
            if (encoding) {
                this.inputMap.restoreBinding(cmd, encoding);
            }

        }

    }

    private initDefaults() {

        if (this.supportsPointer) {

            this.inputMap.addCommand(CommandKey.MoveDest, {
                type: 'pointerdown',
                button: 0
            });

            this.inputMap.addCommand(CommandKey.UsePrimary, {

                type: 'keydown',
                key: ' '
            }, {
                type: 'pointerdown',
                button: 0,
                ctrlKey: true
            }, {
                type: 'pointerdown',
                button: 2
            });
        }


        if (this.supportsTouch) {
            this.inputMap.addCommand(CommandKey.MoveDest, {
                type: 'touchstart',
                touchCount: 0
            });

            this.inputMap.addCommand(CommandKey.UsePrimary, {
                type: 'touchStart',
                touchCount: 0,
                ctrlKey: true
            }, {
                type: 'touchstart',
                touchCount: 2
            }, {

                type: 'keydown',
                key: ' '
            });

        }

        this.inputMap.addCommand(CommandKey.ToggleCraftSelect, {
            type: 'keydown',
            key: 'c'
        });

        this.inputMap.addCommand(CommandKey.ToggleChat, {

            type: 'keydown',
            key: 'Tab'
        });

        this.inputMap.addCommand(CommandKey.Settings, {

            type: 'keydown',
            key: '`'
        });

        this.inputMap.addCommand(CommandKey.UseAbility1, {
            type: 'keydown',
            key: 'a'
        });
        this.inputMap.addCommand(CommandKey.UseAbility2, {
            type: 'keydown',
            key: 's'
        });
        this.inputMap.addCommand(CommandKey.UseAbility3, {
            type: 'keydown',
            key: 'd'
        });
        this.inputMap.addCommand(CommandKey.UseAbility4, {
            type: 'keydown',
            key: 'f'
        });

        this.inputMap.addCommand(CommandKey.Menu, {
            type: 'keydown',
            key: 'Escape'
        })
        if (import.meta.env.DEV) {

            this.inputMap.addCommand(CommandKey.DebugResetAbilities, {
                type: 'keydown',
                key: 'g'
            });
        }
    }

    public rebindCommand(cmd: CommandKey, input: InputParams<EventTypes>, index: number = 0) {

        const newBinding = this.inputMap.bindCommand(cmd, input, index);

        if (this.game) {

            this.game.emit(InputGroup.EventBindInput, cmd, newBinding, index);

            useSettingsStore().saveBindings(this.inputMap.bindings);

        }

    }

    public enable() {
        super.enable();
        this.listen();
    }
    public disable() {

        this.endListen();
        super.disable();
    }


    /**
     * Listen for supported events.
     */
    private listen() {

        if (!this._listening) {
            this._listening = true;
            for (const type of this.listenEvents) {

                if (isKeyType(type)) {
                    this.addKeyListener(type);
                } else if (isMouseType(type) || isTouchType(type)) {
                    this.addMouseListener(type);
                } else if (isTouchType(type)) {

                }

            }
        }

    }

    /**
     * Stop listening for events.
     */
    private endListen() {

        if (this._listening) {
            for (const type of this.listenEvents) {
                if (isKeyType(type)) {
                    this.removeKeyListener(type);
                } else if (isMouseType(type) || isTouchType(type)) {
                    this.removeMouseListener(type);
                }
            }
            this._listening = false;
        }

    }

    /**
     * Manually trigger a command.
     * @param cmd 
     * @param evt - object to send as second parameter
     * to any listeners on the command.
     */
    /*public triggerCommand(cmd: CommandKey, evt: any) {
        this.game?.emit(cmd, cmd, evt);
    }*/

    private routeCommand(cmd: CommandKey, evt: UIEvent | FederatedEvent) {

        if ('originalEvent' in evt) {
            evt.originalEvent.stopPropagation();
        } else {
            evt.preventDefault();
        }
        this.game!.emit(cmd, cmd, evt);
    }


    /**
     * Stop listening for an event type.
     * @param evt 
     */
    private removeKeyListener(evt: TKeyEvents) {

        const listener = this._keyListeners.get(evt);
        if (listener) {
            document.removeEventListener(evt, listener);
        }

    }

    /**
     * Stop listening for an event type.
     * @param evt 
     */
    private removeMouseListener(evt: TPointerEvents) {

        const listener = this._mouseListeners.get(evt);
        if (listener) {
            this.game!.stage.off(evt, listener);
        }

    }


    /**
     * Listen for event type.
     * @param evt - event to listen for.
     */
    private addKeyListener(evt: TKeyEvents) {

        const listener = this._keyListeners.get(evt) ?? this.makeKeyListener();
        document.addEventListener(evt, listener);

        this._keyListeners.set(evt, listener);

    }

    /**
     * Listen for event type.
     * @param evt - event to listen for.
     */
    private addMouseListener(evt: TPointerEvents) {

        const listener = this._mouseListeners.get(evt) as (evt: PixiPointerEvent) => void ?? this.makePointEvent();

        this.game!.stage.on(evt, listener);

        this._mouseListeners.set(evt, listener);

    }

    private makePointEvent<E extends PixiPointerEvent>() {

        return (evt: E) => {

            const cmd = this.inputMap.mapCommand(evt);
            if (cmd) {
                this.routeCommand(cmd, evt);
            } else {
                console.warn(`no command found for event`, evt);
            }
        }

    }



    private makeKeyListener() {

        return (evt: KeyboardEvent) => {

            if (evt.repeat || evt.target !== document.body) {
                return;
            }
            console.log(`input evt: ${evt.key}`);
            const cmd = this.inputMap.mapCommand(evt);
            if (cmd) {
                this.routeCommand(cmd, evt)
            }
        }

    }


}