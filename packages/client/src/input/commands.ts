import { TPoint } from "gibbon.js";

/**
 * Represents a ctf internal game command.
 */
export enum CommandKey {

    MoveDest = 'dest',

    /**
     * Open settings.
     */
    Settings = 'settings',
    /**
     * display in-game menu.
     */
    Menu = 'menu',
    ToggleChat = 'toggleChat',
    UsePrimary = 'primary',
    UseAbility1 = 'ability1',
    UseAbility2 = 'ability2',
    UseAbility3 = 'ability3',
    UseAbility4 = 'ability4',
    ToggleSound = 'sounds',
    ToggleCraftSelect = 'charSelect',

    /**
     * Debug only option to reset ability timers.
     */
    DebugResetAbilities = 'resetAbilities'

}

export type CommandEvents = {

    [CommandKey.UsePrimary]: (at: TPoint) => void,
    [CommandKey.MoveDest]: (id: string) => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.Settings]: () => void,
    [CommandKey.ToggleCraftSelect]: () => void

}