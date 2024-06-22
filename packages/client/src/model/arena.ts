import { stringToPoly } from "../../../server/src/engine/data/geom";
import { CtfSchema } from "../../../server/src/model/schema/ctf-schema";
import { TPoint } from 'gibbon.js';
import { getBorder } from '../utils/geom';
import { GeomData, makeRegion, MapData } from "../../../server/src/ctf/data/parser";
import { IRegion } from "../../../server/src/model/regions/iregion";
import { PlayerSchema } from "../../../server/src/model/schema/player-schema";

export type TPolygon = TPoint[];

/**
 * Decodes/stores geometric world information from schema.
 */
export class ArenaData {

    /**
     * Elements encoded as matterworld.
     */
    //private world?: WorldBuilder;

    public readonly state: CtfSchema;

    public readonly mapData: MapData<GeomData>;

    /**
     * Map teamId to team region, if any.
     */
    private readonly teamRegions: Map<string, TPoint[]> = new Map();

    private readonly spawnRegions: Map<string, IRegion> = new Map();

    public teamBorder?: TPoint[];

    public get width() { return this.state.params.arenaWidth }
    public get height() { return this.state.params.arenaHeight }

    constructor(state: CtfSchema, map: MapData<GeomData>) {

        this.state = state;
        this.mapData = map;

    }

    /**
     * 
     * @returns 
     */
    public inSpawnRegion(player?: PlayerSchema) {

        return player && (this.spawnRegions.get(player.team)?.contains(player.pos) === true);

    }

    public getSpawnRegion(teamId: string) {
        return this.spawnRegions.get(teamId);
    }

    public getTeamRegion(teamId: string) {
        return this.teamRegions.get(teamId);
    }


    /**
     * Decode string-encoded parts of schema.
     */
    public decode() {

        const teams = Array.from(this.state.teams.values());
        const dataTeams = this.mapData.teams;

        for (let i = 0; i < teams.length; i++) {

            const team = teams[i];
            const data = dataTeams[i];

            if (team.teamRegion) {

                const points = stringToPoly(team.teamRegion);
                this.teamRegions.set(team.id, points);
            }
            if (data.spawn) {
                const region = makeRegion(data.spawn);
                this.spawnRegions.set(team.id, region);
            }
        }

        /// Create boundary from first two teams.
        if (teams.length < 2) {
            throw new Error(`Arena.decode(): Too few teams: ${teams.length}`);
        }

        const poly1 = this.teamRegions.get(teams[0].id);
        const poly2 = this.teamRegions.get(teams[1].id);

        if (poly1 && poly2) {
            this.teamBorder = getBorder(poly1, poly2);
        }


    }

    public destroy() {

        this.teamRegions.clear();
    }
}