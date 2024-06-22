/**
 * Formatting helpers for strings.
 */


/**
 * Return number with maximum number of decimals
 * @param v 
 * @param n 
 * @returns 
 */
export const precise = (v: number, n: number = 2): number => {

    if (v === Math.trunc(v)) return v;

    const maxDivide = Math.pow(10, n);

    let abs = Math.abs(v);
    let divide = 1;

    while ((abs < maxDivide) && abs !== Math.trunc(abs)) {

        abs *= 10;
        divide *= 10;

    }

    abs = Math.round(abs) / divide;
    return v >= 0 ? abs : -abs;

}

export const timeString = (secs: number) => { return precise(secs) + ' secs'; }

export const toUppercase = (s: string) => {
    return s.length > 1 ? s[0].toLocaleUpperCase() + s.slice(1) : s;
}