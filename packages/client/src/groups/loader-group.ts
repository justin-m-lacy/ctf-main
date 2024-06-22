import { Assets } from 'pixi.js';
import { ClientGame } from '../client-game';
import { AssetsGroup, TexKey } from './asset-group';
import { Resource, Texture, WRAP_MODES } from 'pixi.js';
import { TAssetMap, TAssetGroup, TSourceList, TSubGroup } from '../../map-assets';
import { randElm } from 'gibbon.js/src/utils/array-utils';

export const AssetLoaded = 'assetReady';

/**
 * Group name of a TAssetGroup not belonging to a subcatergory.
 */
const SharedGroup = 'shared';


/**
 * Mainly for decreasing sound on testing.
 */
const BaseVolume = 1;
export class LoaderGroup extends AssetsGroup<ClientGame> {

    public static AssetMapLoaded = 'assetMapLoaded';


    /**
     * Map of assets expected on the server.
     */
    private assetMap?: TAssetMap;

    constructor() {
        super();


        console.log(`loader base: ${import.meta.env.BASE_URL} meta url: ${import.meta.url}`);

        Assets.init({ basePath: './assets/' });

        this.loadAssetMap().then(v => {
            this.assetMap = v;

            this.game?.emit(LoaderGroup.AssetMapLoaded);

        }).catch(err => {
            console.log(`Failed to load assets map: ${err}`);
        });
    }

    /**
     * Load image from images/maps directory.
     * @param image 
     * @param wrapMode 
     * @returns 
     */
    public loadMapImage(image: string, wrapMode?: WRAP_MODES) {
        return this.loadTextureUrl('images/maps/' + image, wrapMode);

    }

    /**
     * Load image from /textures/ directory.
     * @param tex 
     * @param wrapMode 
     * @returns 
     */
    public loadTexture(tex: string, wrapMode?: WRAP_MODES) {

        return this.loadTextureUrl('textures/' + tex, wrapMode);
    }

    /**
     * Preload assets associated with craft.
     * @param craft 
     */
    public preloadCraft(craft: string) {

        const images = this.assetMap?.images[craft];
        if (Array.isArray(images)) {
            Assets.load(images).then(loads => {
                for (const key in loads) {
                    this.addTexture(key, loads[key]);
                }
            }).catch(err => console.warn(err));
        } else if (images) {
            this._preloadDeep(images);
        }

    }

    private _preloadDeep(group: TAssetGroup) {

        for (const subkey in group) {

            const subobj = group[subkey];
            if (Array.isArray(subobj)) {
                Assets.load(subobj).then(loads => {
                    for (const key in loads) {
                        this.addTexture(key, loads[key]);
                    }
                }).catch(err => console.warn(err));

            } else {
                this._preloadDeep(subobj);
            }

        }

    }

    /**
     * Load craft image associated with event, if any.
     * @param craft 
     * @param subgroup 
     */
    public async getImageType(group: string) {

        const url = this.getAnyImage(group);

        if (url) {
            const cur = this.textures.get(url);
            if (cur) {
                return cur;
            } else {

                try {
                    const tex = await Assets.load<Texture>(url) as Texture<Resource>;
                    if (tex) {
                        this.addTexture(url, tex);
                    }
                    return tex;
                } catch (err) {
                    console.error(err);
                }

            }

        }

    }

    public getEventAudio(event: string, craft?: string): Howl | undefined {

        event = event.toLowerCase();

        let url: string | undefined;
        if (craft) {
            url = this.getCraftAudioUrl(craft, event);
        }
        if (!url) {
            url = this.getAudioEventUrl(event);
        }

        if (url) {
            const cur = this.sounds.get(url) as Howl;
            if (cur) {
                return cur;
            } else {

                const audio = new Howl({
                    src: './assets/' + url,
                    autoplay: false,
                    volume: BaseVolume
                });
                this.addSound(url, audio);

                return audio;

            }
        }


    }

    /**
     * Load random audio based on game event.
     * @param craft 
     * @param event 
     * @returns 
     */
    public getCraftAudio(craft: string, event: string): Howl | undefined {

        /// Get url of random audio to play.
        const url = this.getCraftAudioUrl(craft, event);

        if (url) {
            const cur = this.sounds.get(url);
            if (cur) {
                return cur as Howl;
            } else {

                const audio = new Howl({
                    src: './assets/' + url,
                    autoplay: false,
                    volume: BaseVolume
                });
                this.addSound(url, audio);

                return audio;

            }

        }


    }


    /**
     * Get url of audio event, not tied to specific craft.
     * @param event 
     * @param subgroup 
     * @returns 
     */
    public getAudioEventUrl(event: string,) {

        const assets = this.assetMap?.audio[SharedGroup];
        if (assets) {
            return this.randMatch(assets, '/' + event);
        }

    }


    /**
     * Get url of audio specific to a craft for event.
     * @param craft 
     * @param event 
     * @returns 
     */
    public getCraftAudioUrl(craft: string, event?: string) {

        const assets = this.assetMap?.audio[craft];
        if (assets) {
            return this.randomFromGroup(assets, event);
        }

    }

    public getCraftImageUrl(craft: string, event?: string) {

        const group = this.assetMap?.images[craft];
        return group ? this.randomFromGroup(group, event) : undefined;

    }

    public getImageUrl(imageGroup: string, subtype?: string) {

        if (subtype) {
            const url = this.getCraftImageUrl(subtype, imageGroup);
            if (url) return url;
        }
        const group = this.assetMap?.images[imageGroup];
        return group ? this.randomFromGroup(group, subtype) : undefined;

    }

    /**
     * Get any image from an image group.
     * @param imageGroup 
     */
    private getAnyImage(imageGroup: string) {

        const group = this.assetMap?.images[imageGroup];
        if (group) {

            if (Array.isArray(group)) {
                return randElm(group);
            } else {

                const keys = Object.getOwnPropertyNames(group);
                if (keys.length > 0) {
                    const list = group[keys[Math.floor(Math.random() * keys.length)]];
                    return randElm(list);
                }
            }

        }

    }

    /**
     * Pick random event element from group. This function does not require
     * a substring match if the specific subgroup is not available.
     * @param group 
     * @param event 
     * @returns 
     */
    private randomFromGroup(group: TSubGroup, subgroup?: string): string | undefined {

        /// No subgroups.
        if (Array.isArray(group)) {

            if (group.length > 0) {
                /// TODO: pick random with 'event' in file name?
                return group[Math.floor(Math.random() * group.length)];
            }

        } else if (subgroup) {

            const sub = group[subgroup] as TSourceList;
            if (sub && sub.length > 0) {
                return sub[Math.floor(Math.random() * sub.length)];
            }


        } else if ('shared' in group) {
            return this.randomFromGroup(group.shared);
        }

    }

    /**
     * Get random from group with a matching substring.
     * @param group 
     * @param match 
     */
    private randMatch(group: TSubGroup, match: string): string | undefined {

        if (Array.isArray(group)) {

            const matches = group.filter(v => v.includes(match));

            if (matches.length > 0) {
                return matches[Math.floor(Math.random() * matches.length)];
            }

        } else {

            const sub = group[match] as TSourceList;
            if (sub && sub.length > 0) {
                return sub[Math.floor(Math.random() * sub.length)];
            }


        }

    }

    /**
     * Load map of asset locations.
     */
    private async loadAssetMap() {

        try {
            return Assets.load('asset-map.json');
        } catch (err) {
            console.error(`${err}`);
        }

    }


    /**
     * Load flag image asset.
     */
    public async loadFlag() {

        const cur = this.textures.get(TexKey.Flag);
        if (cur) {
            return cur;
        } else {
            try {
                Assets.add(TexKey.Flag, `images/${TexKey.Flag}.{webp,jpg,png}`);
                const tex = await Assets.load<Texture>(TexKey.Flag) as Texture<Resource>;
                this.addTexture(TexKey.Flag, tex);
                return tex;
            } catch (err) {
                console.log(`flag failed to load: ${err}`);
            }
        }
    }

    /**
     * Load texture relative to base public directory.
     * @param key 
     * @param wrapMode 
     * @returns 
     */
    public async loadTextureUrl(key: string, wrapMode?: WRAP_MODES) {

        const cur = this.textures.get(key);
        if (cur) {
            return cur;
        } else {

            try {
                const tex = await Assets.load<Texture>(key) as Texture;
                if (wrapMode) {
                    tex.baseTexture.wrapMode = WRAP_MODES.MIRRORED_REPEAT;
                }
                this.addTexture(key, tex);
                return tex;
            } catch (err) {
                console.warn(`asset failed to load: ${err}`);
            }


        }

    }

    public async loadCraftImage(craft: string) {

        const cur = this.textures.get(craft);
        if (cur) {
            return cur;
        } else {


            /// url path '/' and '.' are included to avoid partial matches.
            const url = this.getGroupMatch(this.assetMap?.images.crafts, `/${craft}.`);
            if (url) {
                Assets.add(craft, url);
            } else {
                Assets.add(craft, `images/crafts/${craft}.webp`);
            }

            const tex = await Assets.load<Texture>(craft) as Texture;
            this.addTexture(craft, tex);

            return tex;

        }

    }

    private getGroupMatch(group: TSubGroup | undefined | null, substring: string) {

        if (group) {
            if (Array.isArray(group)) {
                return group.find(v => v.includes(substring));
            } else {
                return group['shared']?.find(v => v.includes(substring));
            }
        }
        return null;

    }

    onDestroy() {
        super.onDestroy?.();
        Assets.reset();
    }

}