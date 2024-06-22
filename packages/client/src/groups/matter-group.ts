import { Actor, System, EngineEvent } from 'gibbon.js';
import { Engine, World, Body, Pair, Composite, Events } from 'matter-js';
import { MatterBody } from '../../../server/src/ctf/components/hits/matter-body';
import { BodyHit } from '../components/hits/body-hit';

type CollideStart = {
    pairs: Pair[];
    timestamp: number;
    source: Engine;
    name: string;
}



export class MatterGroup extends System {

    /**
     * event: component, pair, otherBody
     */
    public static readonly Collision = 'collide';
    public static readonly EndCollision = 'endcollide';

    public readonly engine: Engine;

    public get world() { return this.engine.world; }

    private readonly actorBodies: Map<string, Body | Composite> = new Map();
    private readonly components: Map<string, BodyHit<any>> = new Map();

    private _listener?: (e: CollideStart) => void;
    private _endListener?: (e: CollideStart) => void;


    constructor(world?: World) {

        super();
        this.engine = Engine.create({

            world: world ?? World.create({
                gravity: { x: 0, y: 0, scale: 1 }
            }),
            positionIterations: 6,
            velocityIterations: 2,
            enableSleeping: false,
            gravity: { x: 0, y: 0 }

        });

    }

    onAdded() {

        super.onAdded();

        if (!this._listener) this._listener = this._makeListener(MatterGroup.Collision);
        if (!this._endListener) this._endListener = this._makeListener(MatterGroup.EndCollision);

        Events.on(this.engine, 'collisionStart', this._listener);
        Events.on(this.engine, 'collisionEnd', this._endListener);

    }

    onRemoved() {
        super.onRemoved();
        if (this._listener) {
            Events.off(this.engine, "collisionStart", this._listener);
        }
        if (this._endListener) {
            Events.off(this.engine, "collisionEnd", this._endListener);
        }
    }
    /**
     * Add body used by engine. Component must have an actor.
     * Body is automatically removed from engine when
     * the actor is destroyed.
     * @param mb 
     */
    public addActor(comp: BodyHit,) {

        const body = comp.body;
        body.label = comp.actor!.id.toString();
        this.actorBodies.set(body.label, body);
        this.components.set(body.label, comp);
        comp.actor!.on(EngineEvent.ActorDestroyed, this.onRemoveComp, this);


        Composite.add(this.engine.world, body);

    }

    private onRemoveComp(actor: Actor) {


        const key = actor.id.toString();
        const body = this.actorBodies.get(key);
        this.actorBodies.delete(key);
        this.components.delete(key);

        if (body) {
            Composite.remove(this.engine.world, body);
        }


    }

    update(delta: number) {
        Engine.update(this.engine, 1000 * delta);
    }

    private _makeListener(event: string) {

        // bodyHit func to call.
        const func = event === MatterGroup.Collision ? 'collide' : 'endCollide';

        return (evt: CollideStart) => {

            for (let i = evt.pairs.length - 1; i >= 0; i--) {
                const pair = evt.pairs[i];

                //console.log(`types: ${pair.bodyA.collisionFilter.category} vs ${pair.bodyB.collisionFilter.category}`);
                /*console.log(`collision: ${pair.bodyA.label ?? pair.bodyA.id} v. ${pair.bodyB.label ?? pair.bodyB.id}`);*/

                const a1 = this.components.get(pair.bodyA.label);
                const a2 = this.components.get(pair.bodyB.label);

                if (a1?.enabled) {
                    a1.actor?.emit(event, a1, pair, pair.bodyB, a2);
                    a1[func]?.(pair, pair.bodyB, a2);
                }
                if (a2?.enabled) {
                    a2.actor?.emit(event, a2, pair, pair.bodyA, a1);
                    a2[func]?.(pair, pair.bodyB, a2);
                }

            }
        }
    }

    onDestroy() {

        Composite.clear(this.world, false, true);

        this._listener = undefined;
        this._endListener = undefined;

    }
}