
/**
 * Priorities of Game Components.
 * Lower priority numbers are processed first.
 */
export enum Priorities {

    Mover = 2000,
    Driver = 5000,
    Hits = 6000,
    ServerSync = 7000,
    Bounds = 99999,
    Last = Number.MAX_SAFE_INTEGER

}