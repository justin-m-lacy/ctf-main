import { Actor, Group, Mover } from 'gibbon.js';
import { LocalPlayer } from '../components/player/local-player';
import { Player } from '../components/player/player';
import { RemotePlayer } from '../components/player/remote-player';
import type { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { FlagSchema } from '../../../server/src/model/schema/flag-schema';
import { Flag } from '../components/flag';
import { BulletSchema } from '../../../server/src/model/schema/bullet-schema';
import { Bullet } from '../components/bullet';
import { Visuals } from '../groups/visuals';
import { CtfGroup } from '../groups/ctf-group';
import { Container, Sprite, Graphics, Point } from 'pixi.js';
import { ClientGame } from '@/client-game';
import { LoaderGroup } from '../groups/loader-group';
import { AngleBob } from '@components/angle-bob';
import { Rotater } from '../components/motion/rotater';
import { RadPerDeg } from '../utils/geom';
import { ActorImage } from '../components/actor-image';
import { Tween, Easing } from 'tweedle.js';
import { BodySchema } from '../../../server/src/model/schema/body-schema';
import { TCraft } from '../../../server/src/ctf/data/craft-type';
import { LerpBody } from '../components/motion/lerp-body';
import { ArcMeter } from '../components/player/arc-meter';
import { MatchAngle } from '../components/motion/match-angle';
import { Follow } from '../components/follow';
import { SmokeComponent } from '../components/visual/smoke';
import { SpeedLerp } from '../components/motion/speed-lerp';
import { BodyType, ShotType } from '../../../server/src/model/schema/types';
import { HookEffect } from '../components/visual/hook-effect';
import { LerpPos } from '../components/motion/lerp-pos';
import { MoveInput } from '../components/player/move-input';
import { CopyAngle } from '../components/motion/copy-angle';
import { FlameConeFx } from '../components/player/flame-cone-fx';
import { BodyHit } from '../components/hits/body-hit';
import { Bodies } from 'matter-js';
import { DamageBody } from '../../../server/src/model/matter';
import { BlastSchema } from '../../../server/src/model/schema/blast-schema';
import { FlameBurstFx } from '../components/player/flame-burst-fx';
import { MatterGroup } from '../groups/matter-group';

/**
 * Build actors for a match.
 */
export class ActorBuilder extends Group<ClientGame> {

    private ctf: CtfGroup;

    private visuals: Visuals;

    private assets!: LoaderGroup;

    private matterGroup: MatterGroup;

    constructor(visuals: Visuals, matterGroup: MatterGroup, ctf: CtfGroup) {

        super();

        this.visuals = visuals;
        this.matterGroup = matterGroup;
        this.ctf = ctf;

    }

    onAdded() {
        this.assets = this.game!.getGroup(LoaderGroup)!;
        console.assert(this.assets != null, 'LoaderGroup missing.');
    }

    public makeLocalPlayer = (schema: PlayerSchema, color: number, group: Group): LocalPlayer => {

        const go = this.makePlayer(schema, color, group);
        const player = go.add<Player>(new LocalPlayer(schema, color)) as LocalPlayer;


        player.actor!.add(new MoveInput(this.game!.activeMatch!));

        if (import.meta.env.DEV) {
            this.makePlayerGhost(schema, 0x00dd00, group);
        }



        return player;

    }

    public makeRemotePlayer = (schema: PlayerSchema, color: number, group: Group): RemotePlayer => {

        const go = this.makePlayer(schema, color, group);

        this.visuals.makeLabel(go, schema.name);

        const player = go.add<RemotePlayer>(new RemotePlayer(schema, color)) as RemotePlayer;
        if (import.meta.env.DEV) {
            this.makePlayerGhost(schema, 0x00dd00, group);
        }

        /*if (import.meta.env.DEV) {
            this.makePlayerGhost(schema, color, group);
        }*/

        return player;

    }

    private makePlayer = (schema: PlayerSchema, color: number, group: Group): Actor<Container> => {

        const container = new Container();
        const go = new Actor<Container>(container, schema.pos);

        /// Don't rotate the clip when actor rotates.
        go.autoRotate = false;


        group.add(go);

        go.add(new ArcMeter({
            source: schema,
            prop: 'hp',
            maxProp: 'maxHp',
            radius: schema.radius + 1,
            offset: Math.PI,
            reverse: true,
            thickness: 6
        }));

        go.add(new ArcMeter({
            source: schema,
            prop: 'manaPct',
            radius: schema.radius + 1,
            offset: 0,
            color: 0xaa00aa,
            thickness: 5
        }));

        const base = this.assets.getCraftBase(schema.radius, color);
        container.addChild(base);
        //this.visuals.addDropShadow(container);
        this.visuals.initCraftSprite(go, schema.radius);


        go.require(MatchAngle).addChild(base);

        return go;

    }

    /**
     * Make view of player at actual received server positions for debugging.
    * @param schema 
    * @param color 
    * @param group 
    */
    private makePlayerGhost = (schema: PlayerSchema, color: number, group: Group): Actor => {

        const container = new Container();
        const go = new Actor<Container>(container, schema.pos);

        /// Don't rotate the clip when actor rotates.
        container.alpha = 0.3;

        const base = this.assets.getCraftBase(schema.radius, color);
        container.addChild(base);

        go.addInstance(new Follow(schema.pos));
        go.addInstance(new CopyAngle(schema, 'angle'));

        group.add(go);
        return go;

    }

    public updateCraftImage = (p: Player, craft: string) => {
        p.require(ActorImage).waitLoad(this.assets.loadCraftImage(craft));
    }

    public makeHook(schema: BodySchema, group?: Group) {

        const player = this.game?.activeMatch?.getPlayer(schema.player);
        if (!player) {
            console.log(`Missing hook player: ${schema.player}`);
            return null;
        }

        const craftData = player ? this.assets.getCraftData(player.craft) : undefined;

        const go = new Actor(new Graphics());

        const color = craftData?.color ?
            parseInt(craftData.color, 16) : 0xffffff;

        const hookEnd: Point = new Point(schema.pos.x, schema.pos.y);
        go.addInstance(new LerpPos(schema.pos, hookEnd));
        go.addInstance(new HookEffect(player!.pos, hookEnd, color));


        (group ?? this.ctf).add(go);

        return go;

    }

    /**
     * Create image for Body object spawned on server.
     * @param schema 
     * @param group 
     * @returns 
     */
    public makeBody(schema: BodySchema, moveToBack: boolean = false, group?: Group): Actor {

        const player = this.game?.activeMatch?.getPlayer(schema.player);
        const craftData = player ? this.assets.getCraftData(player.craft) : undefined;

        const go = new Actor(new Container(), schema.pos);

        this.addBodyVisual(go, schema, craftData);
        go.add(new LerpBody(schema));

        go.clip?.scale.set(0.1, 0.1);
        new Tween(go.clip!).to({ scale: { x: 1, y: 1 } }, 0.3).easing(Easing.Bounce.Out).safetyCheck(v => !v.destroyed).start();

        (group ?? this.ctf).add(go);
        go.rotation = schema.angle;

        if (moveToBack) {
            go.clip!.parent?.setChildIndex(go.clip!, 0);
        }
        return go;


    }
    public makeHiddenBody(schema: BodySchema, group?: Group): Actor {

        const player = this.game!.activeMatch!.getPlayer(schema.player);
        const craftData = player ? this.assets.getCraftData(player.craft) : undefined;
        const go = new Actor(new Container(), schema.pos);

        const myTeam = this.game!.activeMatch?.getLocalPlayer()?.team;
        if (myTeam === schema.team) {
            this.addBodyVisual(go, schema, craftData);
        }
        go.add(new LerpBody(schema));
        (group ?? this.ctf).add(go);

        go.clip!.parent?.setChildIndex(go.clip!, 0);

        return go;


    }


    public makeHoming = (schema: BulletSchema, player?: Player, group?: Group) => {

        const match = this.game?.activeMatch;
        const playerData = match?.getPlayer(schema.player);
        const craftData = playerData ? this.assets.getCraftData(playerData.craft) : undefined;

        const clip = this.visuals.makeBullet(ShotType[schema.type], schema.radius, schema.radius, craftData);
        const go = new Actor(clip, schema.pos ?? player?.position ?? playerData?.pos);


        go.addInstance(new SpeedLerp(schema, match!.getLatency(), match!.getState().patchRate));
        go.addInstance(new SmokeComponent());

        (group ?? this.ctf).add(go);

        return go;

    }

    /**
     * 
     * @param schema 
     * @param player - Local Player component used to spawn bullet at local player position.
     * @param group 
     * @returns 
     */
    public makeBullet = (schema: BulletSchema, player?: Player, group?: Group) => {

        const playerData = this.game?.activeMatch?.getPlayer(schema.player);
        const craftData = playerData ? this.assets.getCraftData(playerData.craft) : undefined;

        const bulletName = ShotType[schema.type];
        const customVisuals = this.assets.getObjectVisual(craftData?.id, bulletName);

        const clip = this.visuals.makeBullet(
            bulletName,
            customVisuals?.width ?? 2 * (customVisuals?.radius ?? schema.radius),
            customVisuals?.height ?? 2 * (customVisuals?.radius ?? schema.radius),

            craftData);

        const go = new Actor(clip, this.getBulletOrigin(schema, player));
        const bullet = new Bullet(schema);

        if (schema.type === ShotType.thrown) {

            new Tween(clip).to({ width: 2.5 * clip.width, height: 2.5 * clip.height }, schema.time / 2).easing(Easing.Sinusoidal.Out).yoyo(true).yoyoEasing(Easing.Sinusoidal.In).safetyCheck(t => !t.destroyed).repeat(1).start();
            go.addInstance(new SmokeComponent());

        }

        if (customVisuals?.spin) {
            const mover = go.require(Mover);
            mover.omega = mover.omegaMax = customVisuals.spin * Math.PI / 180;
        }


        go.add(bullet, Bullet);

        group ? group.add(go) : this.ctf.add(go);

        return bullet;

    }

    public makeFlameBurst(b: BlastSchema, filterLayer: Container): Actor | null {

        if (!b.player) {
            console.warn(`no flame burst owner`);
            return null;
        }
        const owner = this.ctf.getPlayer(b.player);
        if (!owner) {
            console.log(`player not found: ${b.player}`);
            return null;
        }

        const pos = owner.position;
        const a = new Actor(null, pos);

        a.add(new FlameBurstFx(filterLayer, { maxR: b.endRadius, minR: b.startRadius, totalTime: b.time }));


        const hit = new BodyHit(Bodies.circle(pos.x, pos.y, b.endRadius,
            DamageBody), b);

        hit.ignoreTeam = b.player;

        a.addInstance(hit);

        this.add(a);

        this.matterGroup.addActor(hit);


        return a;


    }
    public makeFlameCone(b: BodySchema, filterLayer: Container): Actor | null {

        if (!b.player) {
            console.warn(`no flamecone owner`);
            return null;
        }
        const owner = this.ctf.getPlayer(b.player);
        if (!owner) {
            console.log(`player not found: ${b.player}`);
            return null;
        }

        const a = new Actor(null, owner.position);
        a.add(new Follow(owner, new Point(1.22 * owner.radius, 0), true));

        const len = 2 * b.extents.x;
        const base = b.extents.y;

        a.addInstance(new FlameConeFx(filterLayer));

        const hit = new BodyHit(Bodies.fromVertices(b.pos.x, b.pos.y,

            [[{ x: 0, y: 0 },
            { x: len, y: base },
            { x: len, y: -base }]],
            DamageBody), b);

        hit.ignoreTeam = b.player;

        a.addInstance(hit);

        this.add(a);

        this.matterGroup.addActor(hit);


        return a;

    }

    /**
     * Get start of bullet at edge of player radius.
     * @param schema 
     * @param player 
     * @returns 
     */
    private getBulletOrigin(schema: BulletSchema, player?: Player) {

        if (schema.pos || !player) {
            return schema.pos;
        }

        const angle = schema.angle ??
            Math.atan2(schema.dest.y - player.y, schema.dest.x - player.x);

        return new Point(player.x + player.radius * Math.cos(angle),
            player.y + player.radius * Math.sin(angle));



    }

    public makeFlag(schema: FlagSchema, color: number, group?: Group) {

        const go = new Actor(new Container(), schema.pos);
        const flag = go.add(new Flag(schema.team, color));

        (group ?? this.ctf).add(go);
        go.clip?.parent.setChildIndex(go.clip, 0);


        this.addFlagVisual(go, schema, color);

        return flag;


    }

    public addBodyVisual = async (go: Actor<Container>, schema: BodySchema, craftData?: TCraft) => {

        const url = this.assets.getImageUrl(BodyType[schema.type], craftData?.id);
        const visuals = this.assets.getObjectVisual(craftData?.id, BodyType[schema.type]);


        const color = craftData ? parseInt(craftData.color, 16) : 0x222222;

        if (url) {
            go.add(
                new ActorImage(this.assets.loadTextureUrl(url,), visuals?.width, visuals?.height,

                    () => {
                        this.visuals.drawDefaultBody(schema, color, go.clip)
                    }
                ));
        } else {
            this.visuals.drawDefaultBody(schema, color, go.clip);
        }

        this.visuals.addDropShadow(go.clip!);

    }



    /**
     * Attempts to load flag texture, or draws default flag visual
     * if texture not found.
     * @param go 
     * @param schema 
     * @param color 
     */
    private addFlagVisual = async (go: Actor<Container>, schema: FlagSchema, color: number) => {

        const tex = await this.assets!.loadFlag();
        if (!go.isDestroyed) {

            let vis: Container | undefined = tex ? this.visuals.addFlagTex(go.clip!, schema.size, color) : undefined;

            if (vis) {
                if (import.meta.env.VITE_LENS_FLAG == true) {
                    const filter = this.visuals.addLens(vis, go.clip!, 5);
                    if (filter) {
                        const actor = new Actor(filter.maskSprite as Sprite);
                        this.add(actor);
                        actor.add(new Rotater(120 * RadPerDeg))
                    }

                }
                if (import.meta.env.VITE_CARTOONY) {
                    go.add(new AngleBob(

                        -14 * Math.PI / 180,
                        14 * Math.PI / 180

                    ));
                }
            } else {
                vis = this.visuals.drawFlag(color, schema.size, go.clip!);
            }

            this.visuals.addDropShadow(go.clip!);


        }

    }

    /*makeShadow = (target: Actor, radius: number, offset: TPoint, group?: Group) => {

        const shadow = this.visuals.makeShadow(0.96 * radius, target.clip?.parent);

        const actor = new Actor(undefined, target.position);
        actor.add(new Shadow(shadow, target, offset))

        group?.add(actor);

        return actor;

    }*/

}