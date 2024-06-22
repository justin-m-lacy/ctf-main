import { CommandKey } from "@/input/commands"

/**
 * Map command key to input binding encodings.
 */
export type SavedBindings = Partial<Record<CommandKey, string[]>>;


export type GraphicsPrefs = {

    ownTeamColor?: number;
    enemyTeamColor?: number;
    ownPlayerColor?: Number;
    allyTeamColor?: number;
    backgroundColor?: number;

}

