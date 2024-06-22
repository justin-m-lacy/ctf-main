import { CtfSchema } from '../../model/schema/ctf-schema';
import Actor from '../../engine/actor';
import { TPoint } from '../../engine/data/geom';
import { BlastSchema } from '../../model/schema/blast-schema';
import { MatterBlast } from '../components/hits/matter-blast';
import { MatterData } from '../components/hits/matter-data';
import { InternalEvent } from '../data/consts';
import { MatterPortal } from '../components/hits/matter-portal';
import { IRegion } from '../../model/regions/iregion';
import Group from '../../engine/group';
import { CtfMatch } from '../ctf-match';
import { BodyType } from '../../model/schema/types';

export class BlastSystem extends Group<CtfMatch> {

    ctf: CtfSchema;

    constructor(schema: CtfSchema) {

        super();
        this.ctf = schema;

    }

    onAdded() {
        super.onAdded();
        this.game!.on(InternalEvent.MatchStart, this.reset, this);
    }

    onRemoved() {
        super.onRemoved();
        this.reset();
    }

    public spawnPortal(at: TPoint, endRadius: number = 140, excludeTeam: string, dest?: IRegion | TPoint, creator?: string, startRadius: number = 1) {

        const a = new Actor(at);
        const b = new BlastSchema({
            id: `${a.id}`,
            type: BodyType.portal,
            player: creator,
            startRadius: startRadius,
            endRadius: endRadius,
            time: 0.75

        }, at);

        const body = new MatterPortal(b, excludeTeam, dest);
        a.addInstance(body);
        this.addActor(a);
    }

    public spawnBlast(at: TPoint, startRadius: number, endRadius: number = 60, creator?: string, type: BodyType = BodyType.blast) {

        const a = new Actor(at);
        const b = new BlastSchema({
            id: `${a.id}`,
            type: type,
            player: creator,
            startRadius: startRadius,
            endRadius: endRadius
        }, at);

        a.addInstance<MatterData>(new MatterBlast(b), MatterData);
        this.addActor(a);

    }

    /**
     * Destroy all blasts.
     */
    reset() {
        this.ctf.bodies.clear();

        /// destroys game objects associated with group.
        this.clearObjects();
    }
}