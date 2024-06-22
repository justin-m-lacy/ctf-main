const filterRE = /^\s*#version 300 es/g;

/**
 * Add filter version string to filter source if not present.
 * @param src - shader program.
 */
export const addGlslVersion = (src: string) => {
    return filterRE.test(src) ? src : ('#version 300 es\n' + src);
}