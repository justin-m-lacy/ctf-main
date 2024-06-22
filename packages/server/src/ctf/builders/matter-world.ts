import Matter, { Bodies, Vector, World, Vertices } from 'matter-js';
import { IBodyDefinition, Body } from 'matter-js';
import { HitData, HitType, MapData, GeomData } from '../data/parser';
import { CtfSchema } from '../../model/schema/ctf-schema';
import { SpawnBody, WaterProps, WallProperties } from '../../model/matter';

/**
 * Prepares the basic Matter.js walls and hits from the map data.
 */
export class WorldBuilder {

    private world?: World;

    private readonly schema: CtfSchema;

    /**
     * Spawn bodies by team id.
     */
    public readonly spawns: Map<string, Body> = new Map();

    constructor(schema: CtfSchema) {
        this.schema = schema;
    }

    public build(mapData: MapData<GeomData>, target?: World) {

        if (target) {

            this.world = target;
            this.world.bounds = this.createBounds(mapData.width, mapData.height)

        } else {
            this.world = World.create({
                bounds: this.createBounds(mapData.width, mapData.height)
            });
        }

        try {
            this.addSpawnHits(mapData);
        } catch (err) {
            console.error(err);
        }

        if (mapData.walls) {
            this.addWalls(mapData.walls);
        }

        return this.world;
    }

    private addSpawnHits(mapData: MapData<GeomData>) {

        let ind: number = 0;
        for (const team of this.schema.teams.values()) {

            const spawn = mapData.teams[ind++].spawn;
            if (!spawn) {
                throw new Error(`Team missing spawn: ${team.id} index: ${ind}`);
            }
            const hit = this.addGeomHit(spawn, SpawnBody);
            if (!hit) {
                throw new Error(`Failed to create spawn hit: ${team.id} index: ${ind}`);
            }
            hit!.label = team.id;
            this.spawns.set(team.id, hit);


        }


    }

    private getHitProps(hit: HitData) {
        return hit.type === HitType.Water ? WaterProps : WallProperties;
    }

    private addWalls(walls: HitData[]) {

        for (let i = walls.length - 1; i >= 0; i--) {
            this.addGeomHit(walls[i], this.getHitProps(walls[i]));
        }

    }
    private addGeomHit(hit: GeomData, opts?: IBodyDefinition) {

        if (hit.shape === 'rect') {

            return this.addBody(Bodies.rectangle(hit.x + hit.w / 2, hit.y + hit.h / 2, hit.w, hit.h, opts));
        } else if (hit.shape === 'circ') {
            return this.addBody(Bodies.circle(hit.x, hit.y, hit.r, opts));
        } else if (hit.shape === 'poly') {

            return this.addBody(
                Bodies.fromVertices(hit.origin?.x ?? 0, hit.origin?.y ?? 0, [hit.points], opts)
            );
        }

    }

    private addBody(body: Matter.Body) {
        World.addBody(this.world!, body);
        return body;
    }


    private createBounds(width: number, height: number) {

        return Matter.Bounds.create(Vertices.create([

            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width, y: height },
            { x: 0, y: height }

        ], Bodies.rectangle(width / 2, height / 2, width, height, WallProperties))
        );
    }

}