import { Component } from 'gibbon.js';
import { Container, Sprite } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { isAlive } from '../../../../server/src/model/schema/types';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';

import { ClientGame } from '../../client-game';
import circleTex from '../../../static/textures/circle-1.webp';

import { ReverableTween } from '../../utils/tween';


/**
 * Display an area of effect aura.
 */
export class MagicCircleFx extends Component<Container, ClientGame> implements IAbilityControl {

    private schema!: PlayerSchema;

    private color: number = 0x331122;

    private filter?: GlowFilter;

    private tween?: ReverableTween<Container>;

    private sprite?: Sprite;

    init() {

        /// preload.
        this.game?.assets.loadTextureUrl(circleTex);

    }

    private initSprite() {

        this.schema = this.get(Player)!.schema;
        const color = this.game?.assets.getCraftColor(this.schema.craft);

        const sprite = Sprite.from(circleTex);
        sprite.anchor.set(0.5, 0.5);

        this.filter = new GlowFilter({
            distance: 6,
            color: color ?? this.color,
            knockout: true
        });

        sprite.filters = [
            /// @ts-ignore
            this.filter

        ];

        const radius = this.schema.radius * 1.75;
        sprite.width = sprite.height = 2 * radius;


        this.tween = new ReverableTween({

            target: sprite,
            to: {
                alpha: 1,
            },
            from: {
                alpha: 0
            },
            time: 0.2,
            reverseTime: 0.14,
            onReverse: (s) => {
                this.clip?.removeChild(s)
            }

        });

        return sprite;

    }

    public startAbility(ability: AbilitySchema, data?: TAbilityDef, params?: { color?: number, radius?: number }) {

        if (params) {
            if (params.color) {
                this.color = params.color;
                if (this.filter) {
                    this.filter.color = params.color;
                }
            }
        }

        this.sprite = this.sprite ?? this.initSprite();
        this.sprite.alpha = 0;

        this.clip!.addChildAt(this.sprite, 0);
        this.tween?.start();

    }

    public endAbility() {
        this.tween?.reverse();
    }

    onEnable() {
    }

    onDisable() {
        this.tween?.stop();

        if (this.sprite) {
            this.clip?.removeChild(this.sprite);
        }
    }

    update(delta: number) {

        if (!isAlive(this.schema.state)) {
            this.enabled = false;
        } else if (this.sprite) {
            this.sprite.rotation += 0.2 * Math.PI * delta;
        }

    }

    onDestroy() {

        this.tween?.destroy();

        if (this.filter) {
            this.filter.enabled = false;
            this.filter.destroy();
            this.filter = undefined;
        }
        if (this.sprite) {
            this.sprite.filters = null;
            this.sprite.destroy();
        }

    }
}