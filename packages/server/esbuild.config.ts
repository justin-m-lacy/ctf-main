import esbuild from 'esbuild';
import copyfiles from 'copyfiles';
import { ChildProcess, spawn } from 'child_process';
import { promisify } from 'util';
import { loadEnv } from './load-env';
import * as path from 'path';


const promiseCopy = promisify<string[], any>(copyfiles);

const MODE = process.env.NODE_ENV ?? 'development';
const DEV_MODE = MODE !== 'production';

loadEnv(MODE);


let runner: ChildProcess | null = null;

console.log(`build: ${MODE}`);

build();

process.on('exit', () => {
    runner?.kill();
})

async function build() {

    const buildDir = 'build';

    await esbuild.build({

        tsconfig: 'tsconfig.json',
        alias: {
            'src': './src/'
        },
        entryPoints: ['src/main.ts'],
        outdir: buildDir,
        outbase: __dirname,
        minify: !DEV_MODE,
        //  external: ['*.json'],
        bundle: true,
        incremental: DEV_MODE,
        plugins: [

            {
                name: 'copy-assets',
                setup: (build) => {
                    build.onEnd((result) => {
                        console.dir(result,);
                    })
                }
            }

        ],
        loader: {
            '.json': 'copy'
        },
        watch: DEV_MODE ? {
            onRebuild: (error, result) => {
                if (runner) {
                    runner.kill();
                    runner = startApp(buildDir);
                }
            }
        } : undefined,
        packages: 'external',
        platform: 'node',
        assetNames: '[dir]/[name]',


    });

    await copyAssets(buildDir);

    if (DEV_MODE) {
        runner = startApp(buildDir);
    } else {
        process.exit(0);
    }

}


const startApp = (dir: string) => {

    const runner = spawn(`node`, ['.'], {
        cwd: dir,
        env: {
            ...process.env,
            NODE_ENV: MODE,
        }

    });
    runner.stdout?.pipe(process.stdout);
    runner.stderr?.pipe(process.stderr);
    /*runner.on('error', (err) => {
        console.error(`runner failed: ${err}`);
        process.exit();
    });*/

    return runner;

}


const copyAssets = async (buildDir: string) => {

    const flavorAssets = path.join(flavorDir, 'assets') + '/**/*';
    const envFile = '.env' + (DEV_MODE ? '.development' : '');
    await promiseCopy(
        [

            './assets/**/*',
            path.join(buildDir, 'assets')
            ,

        ],
        {
            // allow overwrite
            soft: false,
            // slice first portion of path
            up: 1,
        });

    await promiseCopy(
        [
            flavorAssets,
            path.join(flavorDir, envFile),
            buildDir

        ],
        {
            // allow overwrite
            soft: false,
            // slice first portion of path
            up: 1,
        });

    await promiseCopy(
        [
            'package.json',
            buildDir
        ],
        {
            // allow overwrite
            soft: false,
        }
    );

}