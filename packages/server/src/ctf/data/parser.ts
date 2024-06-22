
import { CtfSchema } from '../../model/schema/ctf-schema';
import { TeamSchema } from '../../model/schema/team-schema';
import { IRegion } from '../../../src/model/regions/iregion';
import { RectRegion } from '../../model/regions/rect-region';
import { CircleRegion } from '../../model/regions/circle-region';
import { MatchParams } from '../../model/schema/data/match-params';
import { FlagSchema } from '../../model/schema/flag-schema';
import { TPoint } from '../../engine/data/geom';
import { PolygonRegion } from '../../model/regions/polygon-region';


type RectX = Record<'cx' | 'l' | 'r' | 'w', number>;
type RectY = Record<'cy' | 't' | 'b' | 'h', number>;

/**
 * Normalized rect with x,y as the top-left corner, and width and height.
 */
export type NormalRect = {

    shape: 'rect',
    x: number,
    y: number,
    w: number,
    h: number
}

export type RectData = NormalRect | {

    shape: "rect",
} &
    (Pick<RectX, 'cx' | 'w'> | Pick<RectX, 'l' | 'w'> | Pick<RectX, 'r' | 'w'> | Pick<RectX, 'l' | 'r'>) &
    (
        Pick<RectY, 'cy' | 'h'> | Pick<RectY, 't' | 'h'> | Pick<RectY, 'b' | 'h'> | Pick<RectY, 't' | 'b'>
    );

export type PolyData = {

    shape: 'poly',
    points: TPoint[],
    origin?: TPoint

}

export type CircleData = {
    shape: "circ",
    x: number,
    y: number,
    r: number
}


export type GeomData = CircleData | NormalRect | PolyData;
/**
 * Raw Geometry data has more encoding options for easy json construction.
 */
export type RawGeomData = CircleData | NormalRect | RectData | PolyData;


export enum HitType {
    Wall = 'wall',
    Water = 'water'
}

export type HitData<G extends GeomData | RawGeomData = GeomData> = G & {

    /**
     * Optional name for map editing.
     */
    name?: string,
    hitMask?: number,
    type: HitType
}

export type TeamData<G extends GeomData | RawGeomData = GeomData> = {

    flag: {
        x: number,
        y: number,
    },
    spawn: G,
    teamArea?: G
}

export type ImageInfo = {

    type?: 'tile' | 'sprite',
    alpha?: number,
    image: string

}

export type MapData<G extends GeomData | RawGeomData = GeomData> = {

    width: number,
    height: number,

    background?: {
        image?: ImageInfo,
        tile?: ImageInfo,
        color?: number
    }

    colors?: {
        [key: string]: string | number
    },

    teams: TeamData[],
    walls: HitData<G>[]

}

export const asFloat = (t: number | string) => {
    if (typeof t === 'number') {
        return t;
    } else {
        return parseFloat(t);
    }
}

export const parseMapData = (json: string): MapData<GeomData> => {
    return normalizeMapData(JSON.parse(json));
}

export const makeCtfSchema = (mapData: MapData<GeomData>): CtfSchema => {

    const schema = new CtfSchema(
        new MatchParams({
            arenaWidth: mapData.width,
            arenaHeight: mapData.height,
        })
    );

    for (let i = 0; i < mapData.teams.length; i++) {

        const team = makeTeamSchema(mapData.teams[i], i, mapData);
        schema.teams.set(team.id, team);
    }

    return schema;

}

export const normalizeMapData = (data: MapData<RawGeomData>): MapData<GeomData> => {

    return {
        ...data,
        width: data.width,
        height: data.height,
        teams: data.teams.map(normalizeTeam),
        walls: data.walls.map(normalizeHitData)
    }
}

const normalizeTeam = (data: TeamData<RawGeomData>): TeamData<GeomData> => {

    return {
        flag: data.flag,
        teamArea: data.teamArea ? normalizeGeom(data.teamArea) : undefined,
        spawn: normalizeGeom(data.spawn)
    }
}

export const normalizeHitData = (data: HitData<RawGeomData>): HitData<GeomData> => {

    return {
        hitMask: data.hitMask,
        type: data.type,
        ...normalizeGeom(data),
    }
}

export const normalizeGeom = (data: RawGeomData): GeomData => {
    if (data.shape === 'rect') {
        return normalizeRect(data);
    } else {
        return data;
    }
}
export const makeTeamSchema = (data: TeamData, index: number, map: MapData): TeamSchema => {

    const id = 'team' + index;
    return new TeamSchema(
        {
            id: id,
            playerSpawn: makeRegion(data.spawn),
            flag: new FlagSchema({
                team: id,
                spawn: data.flag
            }),
            teamRegion: data.teamArea ? makeRegion(data.teamArea) : makeTeamArea(index, map.width, map.height)

        }
    );


}

/**
 * Create team area from total arena size.
 * @param width 
 * @param height 
 */
const makeTeamArea = (teamNum: number, width: number, height: number) => {

    return new RectRegion(

        (teamNum % 2) * (width / 2),
        0,
        width / 2,
        height

    );
}

/**
 * Turn geometric data into region.
 * @param geom 
 * @returns 
 */
export const makeRegion = (geom: RawGeomData): IRegion => {

    switch (geom.shape) {

        case "rect":
            return makeRect(geom);
        case "circ":
            return new CircleRegion({ x: geom.x, y: geom.y }, geom.r);
        case "poly":
            return new PolygonRegion(geom.points, geom.origin);
        default:
            throw new Error(`Unknown geometry type: ${geom}`);
    }

}

export const normalizeRect = (geom: RectData): NormalRect => {

    let left: number, top: number, width: number, height: number;

    if ('w' in geom) {

        width = geom.w;
        if ('l' in geom) {
            left = geom.l;
        } else if ('x' in geom) {
            left = geom.x;
        } else if ('cx' in geom) {
            left = geom.cx - width / 2;
        } else {
            left = geom.r - width;
        }

    } else {
        width = geom.r - geom.l;
        left = geom.l;
    }

    if ('h' in geom) {

        height = geom.h;
        if ('t' in geom) {
            top = geom.t;
        } else if ('y' in geom) {
            top = geom.y;
        } else if ('cy' in geom) {
            top = geom.cy - height / 2;
        } else {
            top = geom.b - height;
        }

    } else {
        height = geom.b - geom.t;
        top = geom.t;
    }

    return { shape: geom.shape, x: left, y: top, w: width, h: height };
}

export const makeRect = (geom: RectData | NormalRect): IRegion => {

    let left: number, top: number, width: number, height: number;

    if ('w' in geom) {

        width = geom.w;
        if ('l' in geom) {
            left = geom.l;
        } else if ('x' in geom) {
            left = geom.x;
        } else if ('cx' in geom) {
            left = geom.cx - width / 2;
        } else {
            left = geom.r - width;
        }

    } else {
        width = geom.r - geom.l;
        left = geom.l;
    }

    if ('h' in geom) {

        height = geom.h;
        if ('t' in geom) {
            top = geom.t;
        } else if ('y' in geom) {
            top = geom.y;
        } else if ('cy' in geom) {
            top = geom.cy - height / 2;
        } else {
            top = geom.b - height;
        }

    } else {
        height = geom.b - geom.t;
        top = geom.t;
    }

    return new RectRegion(left, top, width, height);

}