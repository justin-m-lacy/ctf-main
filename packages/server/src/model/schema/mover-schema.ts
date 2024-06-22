import { Schema, type } from '@colyseus/schema';
import { PointSchema } from './data/point-schema';

export class MoverSchema extends Schema {


    @type(PointSchema) pos: PointSchema = new PointSchema();

    @type("number") angle: number = 0;

    @type(PointSchema) velocity: PointSchema = new PointSchema();

    @type(PointSchema) accel: PointSchema = new PointSchema();

    @type("number") omega: number = 0;

    @type("number") omegaAccel: number = 0;

}