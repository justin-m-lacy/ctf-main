import esbuild from 'esbuild';
import copyfiles from 'copyfiles';
import { ChildProcess, spawn } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';


const promiseCopy = promisify<string[], any>(copyfiles);

const MODE = process.env.NODE_ENV ?? 'development';
const DEV_MODE = MODE !== 'production';

let runner: ChildProcess | null = null;

console.log(`build: ${MODE} in: ${process.cwd()}`);

build();

process.on('exit', () => {
    runner?.kill();
})

async function build() {

    const buildDir = 'build';

    await esbuild.build({

        tsconfig: 'tsconfig.json',
        entryPoints: ['./src/main.ts'],
        alias: {
            '@': './src/'
        },
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
    runner.on('error', (err) => {
        console.error(`runner failed: ${err}`);
        process.exit();
    });

    return runner;

}


const copyAssets = async (buildDir: string) => {

    const serverAssetsGlob = path.join('.', 'assets') + '/**/*';
    const envFile = '.env' + (DEV_MODE ? '.development' : '');

    await promiseCopy(
        [
            serverAssetsGlob,
            path.join('./', envFile),
            buildDir

        ],
        {
            // allow overwrite
            soft: false,
            // slice portion of path
            up: 0,
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