import { Schema, type } from '@colyseus/schema';
import { RectSchema } from './data/rect-schema';
import { FlagSchema } from './flag-schema';
import { SubclassOpts, Replace } from '../../utils/types';
import { IRegion } from '../regions/iregion';
import { polyToString, TPoint } from '../../../src/engine/data/geom';
import { PlayerSchema } from './player-schema';

export class TeamSchema extends Schema {

    /**
     * Owning team of flag.
     */
    @type("string") id: string = '';

    @type("number") score: number = 0;

    /**
     * Team name.
     */
    @type("string") name: string = '';

    /**
     * Team color.
     */
    @type("uint32") color: number = 0;

    @type(RectSchema) area: RectSchema = new RectSchema();

    @type(FlagSchema) flag: FlagSchema;

    /**
     * Polygon encoding of team region.
     */
    @type("string") teamRegion?: string;

    public _playerSpawn?: IRegion;

    /**
     * Ids of added players.
     * Currently only used to measure team size.
     */
    private readonly _players: string[] = [];

    public get size() {
        return this._players.length;
    }

    constructor(props: Replace<SubclassOpts<TeamSchema, Schema>,
        { playerSpawn?: IRegion, teamRegion?: IRegion, flag: FlagSchema }>
    ) {

        super();

        this.id = props.id ?? '';

        if (props.color) {
            this.color = props.color;
        }
        if (props.playerSpawn) {
            this.setPlayerSpawn(props.playerSpawn);
        }
        if (props.teamRegion) {
            this.setTeamRegion(props.teamRegion);
        }

        this.flag = props.flag;


    }

    public setTeamRegion(region: IRegion) {
        this.teamRegion = polyToString(region.toPolygon());

    }

    public setPlayerSpawn(region: IRegion) {
        this._playerSpawn = region;

    }

    public inSpawnRegion(pt: TPoint) {
        return this._playerSpawn?.contains(pt);
    }

    public getSpawnRegion() { return this._playerSpawn; }

    /**
     * Get point for spawning a player.
     */
    public getSpawnPoint() {
        if (this._playerSpawn) {
            return this._playerSpawn.randPoint();
        } else {
            return this.flag.spawn;
        }
    }

    public addPlayer(p: PlayerSchema) {
        if (this._players.indexOf(p.id) < 0) {
            this._players.push(p.id);
            p.team = this.id;
        }
        return this.id;
    }

    public removePlayer(p: PlayerSchema) {
        const ind = this._players.indexOf(p.id);

        if (ind >= 0) {
            this._players.splice(ind, 1);
        }
        if (p.team === this.id) {
            p.team = '';
        }


    }

}