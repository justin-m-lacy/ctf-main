import { Engine, World, Body, Composite, Events, IEventCollision, Query } from 'matter-js';
import System from '@/engine/system';
import { MatterData } from "../components/hits/matter-data";
import { TPoint } from '../../engine/data/geom';
import { HitCategory } from '../../model/matter';
import { Player } from '../components/player/player';
export class MatterSystem extends System {

    readonly engine: Engine;

    private readonly linkedBodies: Map<number, MatterData> = new Map();

    private _endListener?: (e: IEventCollision<Engine>) => void;
    private _listener?: (e: IEventCollision<Engine>) => void;
    private _activeListener?: (e: IEventCollision<Engine>) => void;

    constructor(world: World) {

        super();

        this.engine = Engine.create({

            world: world,
            positionIterations: 6,
            velocityIterations: 2,
            enableSleeping: false,
            gravity: { x: 0, y: 0 }

        });

    }

    onAdded() {

        super.onAdded();
        Events.on(this.engine, 'collisionStart', this._makeStartListener());
        Events.on(this.engine, 'collisionEnd', this._makeEndListener());
        Events.on(this.engine, 'collisionActive', this._makeActiveListener());

        this.start();
    }

    onRemoved() {
        super.onRemoved();
        if (this._listener) {
            Events.off(this.engine, "collisionStart", this._listener);
            Events.off(this.engine, "collisionEnd", this._endListener!);
            Events.off(this.engine, 'collisionActive', this._activeListener!);
        }
    }
    /**
     * Add body used by engine.
     * Body is automatically removed from engine when
     * the actor is destroyed.
     * @param mb 
     */
    public addMatter(mb: MatterData) {

        const body = mb.getBody();
        if (body) {

            if (!this.linkedBodies.has(body.id)) {
                this.linkedBodies.set(body.id, mb);
                Composite.add(this.engine.world, body);
            } else {
                console.warn(`MatterSystem: Body already exists: ${body.id}`);
            }

        } else {
            console.error(`Error: Missing Matter body: ${mb.actor?.id}`);
        }

    }

    /**
     * Return player at targetted position or null.
     * @param at 
     * @param onlyTeam 
     */
    public getEnemyAt(at: TPoint, excludeTeam: string) {

        const bodies = Query.point(this.engine.world.bodies, at);

        for (let i = bodies.length - 1; i >= 0; i--) {

            if (bodies[i].collisionFilter.category !== HitCategory.Player) {
                continue;
            }
            const player = this.linkedBodies.get(bodies[i].id)?.get(Player);
            if (player && (!excludeTeam || excludeTeam !== player.teamId)) {
                return player;
            }

        }
        return null;

    }

    /**
     * Return player at targetted position or null.
     * @param at 
     * @param onlyTeam 
     */
    public getPlayerAt(at: TPoint) {

        const bodies = Query.point(this.engine.world.bodies, at);

        for (let i = bodies.length - 1; i >= 0; i--) {

            if (bodies[i].collisionFilter.category !== HitCategory.Player) {
                continue;
            }
            const player = this.linkedBodies.get(bodies[i].id)?.get(Player);
            if (player) {
                return player;
            }

        }
        return null;

    }

    /**
     * Return player from team at targetted position.
     * @param at 
     * @param onlyTeam 
     */
    public getTeamPlayer(at: TPoint, team: string) {

        const bodies = Query.point(this.engine.world.bodies, at);

        for (let i = bodies.length - 1; i >= 0; i--) {

            if (bodies[i].collisionFilter.category !== HitCategory.Player) {
                continue;
            }
            const player = this.linkedBodies.get(bodies[i].id)?.get(Player);
            if (player && team === player.teamId) {
                return player;
            }

        }
        return null;

    }

    public getObjectAt(at: TPoint, category: HitCategory) {

        const bodies = Query.point(this.engine.world.bodies, at);
        for (let i = bodies.length - 1; i >= 0; i--) {

            if (bodies[i].collisionFilter.category === category) {
                const obj = this.linkedBodies.get(bodies[i].id);
                if (obj) return obj;
            }

        }
        return null;

    }

    public removeMatter(mb: MatterData) {

        const body = mb.getBody();
        if (body) {
            this.linkedBodies.delete(body.id);
            Composite.remove(this.engine.world, body);
        } else {
            console.error(`Error: Missing Matter body: ${mb.actor?.id}`);
        }

    }

    public getLinkedBody(body: Body) {
        return this.linkedBodies.get(body.id);
    }

    update(delta: number) {
        Engine.update(this.engine, 1000 * delta);
    }

    /**
     * Do not use to add a body linked to an Actor.
     * Use addActor() instead.
     * @param body 
     */
    public addBody(body: Body) {

        World.addBody(this.engine.world, body);

    }

    private _makeEndListener() {

        return this._endListener ?? (

            this._endListener = (evt: IEventCollision<Engine>) => {

                for (let i = evt.pairs.length - 1; i >= 0; i--) {
                    const pair = evt.pairs[i];

                    //console.log(`types: ${pair.bodyA.collisionFilter.category} vs ${pair.bodyB.collisionFilter.category}`);
                    /*console.log(`collision: ${pair.bodyA.label ?? pair.bodyA.id} v. ${pair.bodyB.label ?? pair.bodyB.id}`);*/

                    const mb1 = this.linkedBodies.get(pair.bodyA.id);
                    const mb2 = this.linkedBodies.get(pair.bodyB.id);

                    if (mb1 && mb1.eventMask & (pair.bodyB.collisionFilter.category ?? 0)) {
                        mb1.endCollide?.(pair, mb2);
                    }
                    if (mb2 && mb2.eventMask & (pair.bodyA.collisionFilter.category ?? 0)) {
                        mb2.endCollide?.(pair, mb1);
                    }


                }

            }

        );

    }

    /**
     * Listens for collision start.
     * @returns 
     */
    private _makeStartListener() {
        //if (this._listener) return this._listener;
        return this._listener ?? (this._listener = (evt: IEventCollision<Engine>) => {

            for (let i = evt.pairs.length - 1; i >= 0; i--) {
                const pair = evt.pairs[i];

                //console.log(`types: ${pair.bodyA.collisionFilter.category} vs ${pair.bodyB.collisionFilter.category}`);
                /*console.log(`collision: ${pair.bodyA.label ?? pair.bodyA.id} v. ${pair.bodyB.label ?? pair.bodyB.id}`);*/

                const mb1 = this.linkedBodies.get(pair.bodyA.id);
                const mb2 = this.linkedBodies.get(pair.bodyB.id);

                if (mb1 && mb1.eventMask & (pair.bodyB.collisionFilter.category ?? 0)) {
                    mb1.collide(pair, mb2);
                }

                if (mb2 && mb2.eventMask & (pair.bodyA.collisionFilter.category ?? 0)) {
                    mb2.collide(pair, mb1);
                }


            }
        })
    }

    private _makeActiveListener() {

        return this._activeListener ?? (

            this._activeListener = (evt: IEventCollision<Engine>) => {

                for (let i = evt.pairs.length - 1; i >= 0; i--) {
                    const pair = evt.pairs[i];

                    //console.log(`types: ${pair.bodyA.collisionFilter.category} vs ${pair.bodyB.collisionFilter.category}`);
                    /*console.log(`collision: ${pair.bodyA.label ?? pair.bodyA.id} v. ${pair.bodyB.label ?? pair.bodyB.id}`);*/

                    const mb1 = this.linkedBodies.get(pair.bodyA.id);
                    const mb2 = this.linkedBodies.get(pair.bodyB.id);

                    if (mb1 && mb1.eventMask & (pair.bodyB.collisionFilter.category ?? 0)) {
                        mb1.activeCollide?.(pair, mb2);
                    }
                    if (mb2 && mb2.eventMask & (pair.bodyA.collisionFilter.category ?? 0)) {
                        mb2.activeCollide?.(pair, mb1);
                    }


                }

            }

        );

    }

}