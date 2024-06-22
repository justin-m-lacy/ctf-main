const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;


/**
 * Log a message at percent frequency. For logs that would otherwise
 * be too frequent.
 * @param message 
 * @param pct 
 */
export const rareLog = (message: string, pct: number = 5) => {
    if (100 * Math.random() < pct) {
        console.log(message);
    }
}

export const radToDeg = (rad: number) => {
    return rad * RAD_TO_DEG;
}

/**
 * Convert radian to degree string and round digits.
 * @param rad 
 */
export const formatRadians = (rad: number) => {
    return `${(rad * RAD_TO_DEG).toFixed(1)}`;

}