import type { Howl } from "howler";

/**
 * Typing information for raw fragment, vertex shader files.
 *
 */
declare module '*.frag' {
    const value: string;

    export default value;
}

declare module '*.vert' {
    const value: string;

    export default value;
}
declare global {

    interface Window {
        howler: Howl;
    }
}