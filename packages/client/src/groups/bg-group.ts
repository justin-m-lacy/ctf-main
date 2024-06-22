import { System } from 'gibbon.js';
import { TilingSprite, Sprite, WRAP_MODES } from 'pixi.js';
import { ImageInfo } from '../../../server/src/ctf/data/parser';
import { Texture } from 'pixi.js';
import { LoaderGroup } from './loader-group';
import { ClientGame } from '@/client-game';

export default class BgGroup extends System<ClientGame> {

    public static EvtBgLoaded = 'bgloaded';

    private bgTiler?: TilingSprite;

    private assets!: LoaderGroup;

    private bgImage: Sprite = new Sprite();

    onAdded() {

        this.assets = this.game!.assets;
        this.clip!.addChildAt(this.bgImage, 0);

    }

    onRemoved() {
        this.bgTiler?.destroy();
        this.bgImage.destroy();
    }

    public setBackground(info: {
        tile?: ImageInfo,
        image?: ImageInfo,
        color?: number | string
    }, width: number, height: number) {

        this.bgImage.width = width;
        this.bgImage.height = height;

        if (info.color !== undefined) {
            this.game!.app.renderer.background.color = typeof info.color === 'string' ?
                parseInt(info.color, 16) : info.color;
        }

        if (info.image) {
            this.assets.loadMapImage(info.image.image).then(v => {
                this.setBgImage(v);
                this.emitBgLoaded();
            }).catch(
                () => this.emitBgLoaded()
            );
        } else {
            this.emitBgLoaded();
        }
        if (info.tile) {
            this.assets.loadTexture(info.tile.image, WRAP_MODES.MIRRORED_REPEAT).then(v => {
                if (v) {

                    if (!this.bgTiler) {
                        this.createTiler(v, info.tile?.alpha);
                        this.bgTiler!.width = this.game!.app.screen.width + width;
                        this.bgTiler!.height = this.game!.app.screen.height + height;
                    } else {
                        this.bgTiler.roundPixels = true;
                        this.bgTiler.texture = v;
                        this.bgTiler.alpha = info.tile?.alpha ?? 1;
                    }
                }
            }).catch();
        }

        if (this.bgTiler) {
            this.bgTiler.width = this.game!.app.screen.width + width;
            this.bgTiler.height = this.game!.app.screen.height + height;
        }

    }

    private emitBgLoaded() {
        this.game!.emit(BgGroup.EvtBgLoaded);
    }

    public setBgImage(image?: Texture, width?: number, height?: number, alpha = 1) {
        if (image) {
            this.bgImage.texture = image;
            this.bgImage.alpha = alpha;

            if (width) {
                this.bgImage.width = width;
            }
            if (height) {
                this.bgImage.height = height;
            }

        }
    }

    private createTiler(tex: Texture, alpha: number = 1) {

        //go.x = -this.game.screen.width / 2;
        //go.y = -this.game.screen.height / 2;

        /*const container = new Container();
        this.clip?.addChildAt(container, 0);
        const go = new Actor(container);
        const grid = new Grid(this.game!.app.renderer.backgroundColor);
        go.add(grid);
        this.add(go);*/


        this.bgTiler = new TilingSprite(tex, 2 * this.game!.app.view.width, 2 * this.game!.app.view.height);
        this.bgTiler.alpha = alpha;

        this.bgTiler.x = -this.game!.screen.width / 2;
        this.bgTiler.y = -this.game!.screen.height / 2;
        this.clip!.addChild(this.bgTiler);

        return this.bgTiler;
    }

}