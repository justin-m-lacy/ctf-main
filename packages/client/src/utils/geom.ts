import { TPoint } from 'gibbon.js';

export const TwoPi = 2 * Math.PI;
export const RadPerDeg = Math.PI / 180;
export const DegPerRad = 180 / Math.PI;


/**
 * Clamp angle to [-Math.PI, Math.PI]
 */
export const clampToPi = (a: number) => {

    a = a % (2 * Math.PI);

    if (a > Math.PI) {
        a -= 2 * Math.PI;
    } else if (a < -Math.PI) {
        a += 2 * Math.PI;
    }

    return a;
}




/**
 * Return any continguous edges between poly1, poly2.
 * Any break of continuity will stop the check
 * and return all shared points so far.
 * @param poly1 
 * @param poly2 
 */
export const getBorder = (poly1: TPoint[], poly2: TPoint[]) => {

    const result: TPoint[] = [];

    const len1 = poly1.length;;
    const len2 = poly2.length;

    let p1: TPoint, p2: TPoint;

    let i: number, j: number = -1;
    for (i = 0; i < len1; i++) {

        p1 = poly1[i];

        j = poly2.findIndex(v => v.x === p1.x && v.y === p1.y);
        if (j < 0) {
            continue;
        }
        result.push(p1);
        break;

    }

    if (j < 0) {
        return result;
    }
    /// no point[k] (k<i) of poly1 occurs in poly2, or it would have been found
    /// before i. This means any shared edge must move forward in i.

    /// try poly2 direction +j-index
    for (let k = i + 1, m = j + 1; k < len1; k++, m++) {

        p1 = poly1[k];
        p2 = poly2[m % len2];

        if (p1.x === p2.x && p1.y === p2.y) {
            result.push(p1);
        } else {
            break;
        }

    }

    /// More shared points were found after first match.
    if (result.length > 1) {
        return result;
    }

    /// No new shared points were found moving forward in poly2.
    /// Try matching moving backwards.
    for (let k = i + 1, m = j - 1; k < len1; k++, m--) {

        if (m < 0) {
            m = len2 - 1;
        }
        p1 = poly1[k];
        p2 = poly2[m];

        if (p1.x === p2.x && p1.y === p2.y) {
            result.push(p1);
        } else {
            break;
        }

    }
    return result;

}