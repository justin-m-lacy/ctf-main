import { readdir, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ConfigEnv, UserConfig } from 'vite';

/// TODO: Convert to PIXI asset bundles?
/**
 * CraftName-Event-[effectNumber].ext
 */

/// parent group - sub group name - subgroup count.
export const FileRegEx = /^(?:\w+)-(\w+)(?:-\d+)?\.?(?:\w+)?$/i;

export type TSourceList = string[];

export type TSubGroup = { [event: string]: TSourceList } | TSourceList
export type TAssetGroup = {
    [group: string]: TSubGroup;
}

export type TAssetMap = {
    images: TAssetGroup,
    audio: TAssetGroup
}
export const createAssetMap = () => {

    const assetMap = {

        images: {

        },
        audio: {

        }
    }

    /**
         * Gather all subfolders into asset groups.
         * @param basePath 
         * @param subPath - path based on asset type: images, audio etc.
         * @param assetMap 
         * @returns 
         */
    async function getSubGroups(basePath: string, subPath: string, assetMap: TAssetGroup) {

        try {
            const entries = await readdir(resolve(basePath, subPath), { withFileTypes: true });

            /// assets common at this asset path.
            const shared: string[] = assetMap['shared'] = [];

            for (let i = 0; i < entries.length; i++) {

                const entry = entries[i];
                const childPath = subPath + '/' + entry.name;

                if (entry.isDirectory()) {
                    const subGroup: TAssetGroup = assetMap[entry.name] = {};
                    await addGroupFiles(basePath, childPath, subGroup);
                } else {
                    shared.push(childPath);
                }

            }
        } catch (err) {
            console.log(`${err}`);
            return;
        }

    }

    async function addGroupFiles(basePath: string, subPath: string, group: TAssetGroup) {

        try {
            const entries = await readdir(resolve(basePath, subPath), { withFileTypes: true });

            for (let i = 0; i < entries.length; i++) {

                const entry = entries[i];
                const childPath = subPath + '/' + entry.name;

                if (entry.isDirectory()) {
                    console.warn('Deep asset group: ' + resolve(basePath, subPath, entry.name));
                    //await this.addGroupFiles(basePath, childPath, results);
                } else {

                    /// Split files into sublists by event/numbering.
                    const result = FileRegEx.exec(entry.name);

                    if (result && result.length >= 2) {

                        addToList(group, result[1], childPath);

                    } else {

                        addToList(group, 'shared', childPath)
                    }


                }

            }

        } catch (err) {
            console.log(`${err}`);
            return;
        }

    }

    function addToList(parent: TAssetGroup, group: string, file: string) {

        const cur = parent[group];
        if (Array.isArray(cur)) {
            cur.push(file);
        } else {
            parent[group] = [file];
        }

    }

    return {

        name: 'Assets Map',

        /*uildEnd(this: PluginContext, err?: Error) {

        },*/

        async config(config: UserConfig, env: ConfigEnv) {

            let pubDir = typeof config.publicDir === 'string' ? config.publicDir : 'public';
            pubDir = resolve(process.cwd(), pubDir, 'assets');

            await getSubGroups(pubDir, 'images', assetMap.images);
            await getSubGroups(pubDir, 'audio', assetMap.audio);

            const json = JSON.stringify(assetMap);
            await writeFile(resolve(pubDir, 'asset-map.json'), json);

            return config;
        },


    }

}
