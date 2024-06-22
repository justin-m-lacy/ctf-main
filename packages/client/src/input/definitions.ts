export type AbstractTouch = Partial<TouchEvent> & { touchCount: number };

export type SupportedEvents = 'keydown' | 'mousedown' | 'touchstart' | 'pointerdown' | 'touchmove';
export type SupportedEvent = DocumentEventMap[SupportedEvents];

export type TKeyEvents = Extract<SupportedEvents, 'keydown'>;

export type TPointerEvents = Exclude<SupportedEvents, 'keydown'>;
export type TPointerEvent = DocumentEventMap[TPointerEvents];

export type InputParams<E extends Event = Event> = Partial<E> & Partial<{

    key?: string,
    touchCount?: number,
    button?: number,
    buttons?: number,

}> & Partial<IModifierAware>;

export enum InputModifier {
    None = 0,
    Shift = 1,
    Ctrl = 2,
    Alt = 4,
    Meta = 8
}
/**
 * Describes structure of an Event aware of Keyboard modifier states.
 */
export interface IModifierAware extends UIEvent {
    shiftKey: boolean,
    ctrlKey: boolean,
    altKey: boolean,
    metaKey: Boolean
}

/**
 * Get enumeration of keyboard modifiers present in an input binding.
 * @param evt 
 * @returns 
 */
export const mapModifiers = (input: Partial<IModifierAware>) => {

    let mods = InputModifier.None;
    if (input.shiftKey) {
        mods |= InputModifier.Shift;
    }
    if (input.ctrlKey) {
        mods |= InputModifier.Ctrl;
    }
    if (input.altKey) {
        mods |= InputModifier.Alt;
    }
    if (input.metaKey) {
        mods |= InputModifier.Meta;
    }

    return mods;
}

export const isKeyType = (evt: string): evt is TKeyEvents => {
    return evt.startsWith('key');
}
export const isMouseType = (evt: string): evt is TPointerEvents => {
    return evt.startsWith('mouse') || evt.startsWith('pointer');
}
export const isTouchType = (evt: string): evt is TPointerEvents => {
    return evt.startsWith('touch');
}

/**
 * Get the 'value' of an event based on type.
 * @param evt 
 */
export const eventToValue = (evt: Event | InputParams) => {

    if ('key' in evt) {
        return evt.key;
    } else if ('button' in evt) {
        return evt.button;
    } else if ('touchCount' in evt) {
        return evt.touchCount;
    }
}

/**
 * Get the string-key used to index an event.
 * The mapping key is used to check if a command exists
 * for the input type.
 * @returns 
 */
export const eventToKey = (evt: Event | InputParams) => {

    //let k: keyof typeof evt;
    /*for (k in evt) {
        console.log(`event param: ${k}: ${evt[k]}`)
    }*/
    let value: string | number | undefined;
    if ('key' in evt) {
        value = evt.key;
    } else if ('button' in evt) {
        value = evt.button;
    } else if ('touchCount' in evt) {
        value = evt.touchCount;
    }

    //console.log(`evt key: ${evt.type}:${value ?? 0}:${mapModifiers(evt)}`);

    return `${evt.type}:${value ?? 0}:${mapModifiers(evt)}`

}
