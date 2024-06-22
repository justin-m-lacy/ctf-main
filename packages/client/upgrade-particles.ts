import { readFile, writeFile } from 'fs/promises';
import { glob } from "glob";
import * as particles from '@pixi/particle-emitter';
import path from 'path';
/**
 * Update the configuration version of particle files.
 */
const args = process.argv.slice(2);


const globber = glob(args[0], {}, (err, matches) => {

    if (err) {
        console.error(err);
    } else {

        console.log(`processing matches...: ${matches.length}`);
        processMatches(matches);
    }

});

/*globber.on('end', () => {
    console.log(`globs done.`);
})*/



function processMatches(matches: string[]) {

    matches.map(v => convertFile(v).catch((err) => console.warn(err)));

}

async function convertFile(filePath: string) {

    const buff = await readFile(filePath, {
        encoding: 'utf-8'
    });
    const upgrade = particles.upgradeConfig(JSON.parse(buff), ['tex-replace']);
    const parts = path.parse(filePath);

    return writeFile(path.join(parts.dir, parts.name + '-2' + parts.ext), JSON.stringify(upgrade));

}