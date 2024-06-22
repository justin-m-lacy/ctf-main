import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { CRTFilter } from '@pixi/filter-crt';
import { IPoint, Component } from 'gibbon.js';
import { Point, Container, Filter } from 'pixi.js';
import { removeFilters } from '@/utils/filters';
import { addFilters } from '../../utils/filters';
import { InputGroup } from '../../groups/input-group';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { ClientGame } from '../../client-game';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';

type CamTarget = { position: IPoint, x: number, y: number };

export class SnipeControl extends Component<Container, ClientGame> implements IAbilityControl {

    private readonly crtFilter = new CRTFilter({ vignetting: 0.4, noise: 0.4, vignettingAlpha: 1, lineWidth: 1.7, lineContrast: 0.4, vignettingBlur: 0.26 });

    private readonly filters: Filter[] = [
        this.crtFilter,
        new ColorOverlayFilter(0x009900, 0.7),
        /*new AdjustmentFilter({
            red: 0.6, blue: 0.6, green: 1.2
        }),*/
    ];

    // camera target to restore on end.
    private saveTarg: CamTarget | null = null;

    private ability!: AbilitySchema;

    /**
     * Easing required between mouse point and camera
     * panning.
     */
    private readonly mousePos: Point = new Point();

    /**
     * 
     */
    private readonly camTarg: CamTarget = {

        position: new Point(),
        x: 0, y: 0

    }

    private input!: InputGroup;

    /**
     * Time since last track sent to server. Rate limiting.
     */
    private tickWait: number = 0;

    init() {
        this.input = this.game!.getGroup<InputGroup>(InputGroup)!;
    }

    public startAbility(ability: AbilitySchema, data?: TAbilityDef) {
        this.ability = ability;

        const cam = this.game!.camera!;
        this.saveTarg = cam.target;

        cam.target = this.camTarg;
        this.camTarg.position.set(this.position.x, this.position.y)


        /// add full screen filter.
        addFilters(this.game!.objectLayer.parent, this.filters);
    }

    endAbility() {
        this.enabled = false;
    }

    onDisable() {

        const cam = this.game!.camera;
        if (cam?.target === this.camTarg) {
            cam.target = this.saveTarg;
            this.saveTarg = null;
        }
        removeFilters(this.game!.objectLayer.parent, this.filters);
    }

    update(delta: number) {
        this.input.getLocalPosition(this.game!.objectLayer, this.mousePos);

        const pos = this.camTarg.position;

        let curX = pos.x, curY = pos.y;
        const factor = (delta / 2);

        pos.set(curX + factor * (this.mousePos.x - curX), curY + factor * (this.mousePos.y - curY));

        this.crtFilter.time += delta;
        this.tickWait += delta;
        if (this.tickWait >= 0.25) {


            /// dx,dy to rate limit sending tracking.
            /// Might use time rate limit instead?
            curX -= pos.x;
            curY -= pos.y;

            if (curX * curX + curY * curY > 64) {
                this.tickWait = 0;
                this.game!.activeMatch!.sendTrackPoint(pos, this.ability.id);
            }
        }

    }

    onDestroy() {

        this.filters.every(v => v.destroy());
        this.filters.length = 0;

        this.saveTarg = null;
        this.onDisable();
    }

}