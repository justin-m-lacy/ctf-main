import { Container, Spritesheet, BaseTexture } from 'pixi.js';
import { Group, Actor } from 'gibbon.js';
import { ClientGame } from "@/client-game";
import { Blast } from "@components/visual/blast";
import { MatchEvent } from '../model/match-events';
import { Vortex } from "@components/visual/vortex";
import { BodySchema } from "../../../server/src/model/schema/body-schema";
import { ActorBuilder } from "@/builders/actor-builder";
import type { BlastSchema } from "../../../server/src/model/schema/blast-schema";
import trapExplode from '../../static/spritesheets/red-explosion.png';
import trapData from '../../static/spritesheets/red-explosion.json';
import { SheetAnimation } from '../components/sheet-animation';
import { BodyType, ShotType } from "../../../server/src/model/schema/types";
import { Easing, Tween } from 'tweedle.js';
import { BulletSchema } from '../../../server/src/model/schema/bullet-schema';
import { PlayersGroup } from './players-group';


/**
 * Synchronizes bodies from server with visuals in game.
 */
export class BodySystem extends Group<ClientGame> {

    /// To destroy bullet actors on server bullet removed event.
    private readonly bullets: Map<string, Actor> = new Map();

    // clips associated with blasts.
    private readonly bodies: Map<string, Actor> = new Map();

    /**
     * Container for blast clips.
     */
    private readonly container: Container;

    private readonly builder: ActorBuilder;

    private readonly players: PlayersGroup;


    constructor(container: Container, players: PlayersGroup, builder: ActorBuilder) {
        super();

        this.players = players;
        this.container = container;
        this.builder = builder;

    }

    onAdded() {

        const match = this.game!.activeMatch!;
        match.on(MatchEvent.BodySpawned, this.createBody, this);
        match.on(MatchEvent.BodyRemoved, this.removeBody, this);

        match.on(MatchEvent.BulletSpawned, this.onBulletSpawn, this);
        match.on(MatchEvent.BulletRemoved, this.onBulletRemoved, this);

    }

    onRemoved() {
        this.game!.activeMatch?.off(MatchEvent.BodySpawned, this.createBody, this);
        this.game!.activeMatch?.off(MatchEvent.BodyRemoved, this.removeBody, this);
    }

    private onBulletRemoved(id: string) {

        const bullet = this.bullets.get(id);
        if (bullet) {
            this.bullets.delete(id);
            bullet.destroy();
        }


    }

    private onBulletSpawn(schema: BulletSchema) {

        if (schema.type !== ShotType.homing) {

            const b = this.builder!.makeBullet(schema, this.players.getPlayer(schema.player), this);
            this.bullets.set(schema.id, b.actor!);

        } else if (schema.type === ShotType.homing) {

            const actor = this.builder!.makeHoming(schema,
                this.players.getPlayer(schema.player),
                this);
            this.bullets.set(schema.id, actor);

        }

    }

    private removeBody(body: BodySchema) {
        const actor = this.bodies.get(body.id);
        if (actor) {
            this.bodies.delete(body.id);

            switch (body.type) {

                case BodyType.portal:
                case BodyType.blocker:
                case BodyType.wall:
                case BodyType.damager:


                    if (actor.clip) {
                        new Tween(actor.clip,).to({ scale: { x: 0.05, y: 0.05 } }, 0.2).easing(Easing.Bounce.In).safetyCheck(v => !v.destroyed).onComplete(() => {
                            actor.destroy()
                        }).start();
                    } else {
                        actor.destroy();
                    }

                    break;
                case BodyType.flameburst:
                    console.log(`flame burst end.`);
                    actor.destroy();
                    break;
                default:
                    actor.destroy();

            }


        }

    } // removeBody()

    private createBody(b: BodySchema) {

        let comp;
        let a: Actor | null = null;

        if (!b.id) { console.warn(`MISSING BODY ID: ${b.id}`) }
        switch (b.type) {

            case BodyType.blast:

                a = new Actor();
                comp = new Blast(b as BlastSchema);
                a.addInstance(comp);
                this.add(a);

                comp.addTo(this.container, this.game!.filterLayer);

                break;

            case BodyType.portal:

                a = new Actor();
                comp = new Vortex(b as BlastSchema);
                a.addInstance(comp);
                this.add(a);

                comp.addTo(this.container, this.game!.filterLayer);

                break;
            case BodyType.flamecone:

                a = this.builder.makeFlameCone(b, this.container);
                break;

            case BodyType.flameburst:
                a = this.builder.makeFlameBurst(b as BlastSchema, this.container);
                break;
            case BodyType.damager:
                a = this.builder.makeBody(b, true, this);
                break;
            case BodyType.hook:
                a = this.builder.makeHook(b, this);
                break;
            case BodyType.blocker:
            case BodyType.wall:
                a = this.builder.makeBody(b, false, this);

                break;
            case BodyType.trap:

                a = this.builder.makeHiddenBody(b, this);

                break;
            case BodyType.trapBlast:

                a = this.spawnTrapBlast(b as BlastSchema);
                break;

            default:
                break;
        }

        if (a) {
            this.bodies.set(b.id, a);
        }
    }



    private spawnTrapBlast(b: BlastSchema) {

        const a = new Actor(undefined, b.pos);
        const sheet = new Spritesheet(BaseTexture.from(trapExplode), trapData);

        const anim = new SheetAnimation(sheet, {
            container: this.container,
            width: b.endRadius,
            height: b.endRadius,
            autoPlay: true,
        });
        a.addInstance(anim);

        this.add(a);

        return a;
    }

    onDestroy() {

        if (this.game) {
            this.game.filterLayer.filters = [];
        }

        this.onRemoved();

        //this.container.destroy(true);
        this.bodies.clear();

        this.bullets.clear();


    }
}