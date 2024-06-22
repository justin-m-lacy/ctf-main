import { System, Component } from 'gibbon.js';
import { Sound, Howl } from 'howler';
import { LoaderGroup } from './loader-group';


export class BgmLoop extends System {

    private _playing: boolean = false;

    private _bgm?: Howl;
    private source?: string;

    private assets: LoaderGroup;

    /**
     * source currently being set to test for
     * overlapping set commands.
     */
    private _settingSource?: string;

    constructor(assets: LoaderGroup) {
        super();
        this.assets = assets;
    }

    onAdded() {

        this.playDefault();

    }

    public playDefault() {
        // attempt to play default bgm if it exists.
        this.playBgm('default-bgm');
    }

    public setBgm(audio: Howl, source?: string) {

        if (this._bgm && this.source && this.source == source) {
            // already playing.
            return;
        }
        this.stopBgm();

        this.source = source;
        this._bgm = audio;
        this._bgm.loop(true);

    }

    public async playBgm(name: string,) {

        try {
            this._settingSource = name;
            const result = await this.assets.getEventAudio(name);
            if (result) {


                if (name && this._settingSource !== name) {
                    result.stop();
                } else {
                    this.setBgm(result, name);

                }
            }
        } catch (err) {
            console.warn(`failed to play bgm: ${name}: ${err}`);
        }

    }


    public stopBgm() {
        if (this._bgm) {

            this._bgm.stop();
            this._bgm.unload();
            this.source = undefined;

        }
    }
}