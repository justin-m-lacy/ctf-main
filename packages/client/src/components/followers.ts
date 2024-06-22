import { Component, Actor, TPoint } from 'gibbon.js';
import { Text, Container, DisplayObject } from 'pixi.js';
import { Priorities } from '../priorities';

type TFollower = {

    actor: Actor | Component | DisplayObject,
    offset?: TPoint

}

/**
 * Followers of an actor.
 */
export class Followers extends Component<Text | Container> {

    private readonly followers: TFollower[] = [];

    priority = Priorities.Last;

    public addFollower(actor: Actor | Component | DisplayObject, offset?: TPoint) {

        this.followers.push({
            actor: actor,
            offset: offset
        })
    }

    onDisable() {
        this.hideAll();
    }

    onEnable() {
        this.showAll();
    }

    public hideAll() {

        for (let i = this.followers.length - 1; i >= 0; i--) {

            const a = this.followers[i].actor;
            if ('visible' in a) {
                a.visible = false;

            } else if (a.clip) {
                a.clip.visible = false;
            }

        }

    }

    public showAll() {
        for (let i = this.followers.length - 1; i >= 0; i--) {

            const a = this.followers[i].actor;
            if ('visible' in a) {
                a.visible = true;

            } else if (a.clip) {
                a.clip.visible = true;
            }

        }
    }

    update() {

        const pos = this.position;
        for (let i = this.followers.length - 1; i >= 0; i--) {

            const f = this.followers[i];
            f.actor.position.set(
                pos.x + (f.offset?.x ?? 0),
                pos.y + (f.offset?.y ?? 0)
            );

        }

    }

    onDestroy() {

        for (let i = this.followers.length - 1; i >= 0; i--) {
            this.followers[i].actor.destroy();
        }
        this.followers.length = 0;

    }

}