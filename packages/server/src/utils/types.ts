/**
 * Recursive partial types.
 */
export type Partialize<T> = Partial<{
    [Prop in keyof T]: Partialize<T[Prop]>
}>

/**
 * Allows setting optional properties of subclass S
 * without including properties from parent class P
 */
export type SubclassOpts<S, P> = Partial<{ [Prop in Exclude<keyof S, keyof P>]: S[Prop] }>;


export type Replace<T, O> = Omit<T, keyof O> & O;


/**
 * Restrict type to properties of type S
 */
export type Restrict<T, S> = {
    [K in keyof T]: T[K] extends S ? S : never;
}