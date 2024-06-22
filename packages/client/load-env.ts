import * as dotenv from 'dotenv';
import { resolve } from 'path';



/**
 * Add any variables from overrides
 * @param keep 
 * @param extras 
 */
export const mergeEnv = (base: Record<string, string>, override: Record<string, string | undefined>) => {

    for (const k in base) {

        const val = override[k];
        if (val != null) {
            base[k] = val;
        }

    }
    return base;

}

export const loadEnv = (mode: string, flavorDir?: string) => {

    const dir = flavorDir ?? process.cwd();

    dotenv.config({
        path: resolve(dir, '.env')
    });

    dotenv.config({
        path: resolve(dir, '.env.' + mode),
        override: true
    });


}