/// <reference types="vite/client" />
/**
 * File gives typing information for Vite defened import.meta variables.
 */

interface ImportMetaEnv {
    readonly VITE_GAME_TITLE: string;
    readonly VITE_SHORT_TITLE: string;

    /**
     * String to name flag in messages.
     */
    readonly VITE_FLAG_NAME: string;
    readonly VITE_LENS_FLAG: boolean;

    /**
     * Enable more cartoony effects, when possible.
     */
    readonly VITE_CARTOONY: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}