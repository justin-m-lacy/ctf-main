import { resolve } from "path/posix";
import * as dotenv from 'dotenv';


export const loadEnv = (mode: string, baseDir?: string) => {

    const dir = baseDir ?? process.cwd();

    dotenv.config({
        path: resolve(dir, '.env')
    });

    if (mode) {
        dotenv.config({
            path: resolve(dir, '.env.' + mode)
        });
    }

}