import { CommandBindings } from '@/input/bindings';
import { AbilitySchema } from '../../../server/src/model/schema/data/ability-schema';
import { HtmlWrapper } from 'gibbon.js';
import { timeString, toUppercase } from '../utils/format';
import { TAbilityDesc, TAbilityType } from '../../../server/src/ctf/data/ability';

/**
 * Pane displays information about one specific ability
 * and its input bindings.
 */
export class AbilityPane extends HtmlWrapper {

    private titleDiv!: HTMLDivElement;
    private typeDiv!: HTMLDivElement;
    private durationDiv!: HTMLDivElement;
    private cooldownDiv!: HTMLDivElement;
    private descDiv!: HTMLDivElement;

    private bindingRoot: HTMLDivElement;

    constructor() {

        super('paneAbility');

        const elm = this.element!;

        this.titleDiv = elm.querySelector('.title')!;
        this.typeDiv = elm.querySelector('.type')!;
        this.durationDiv = elm.querySelector('.duration')!;
        this.cooldownDiv = elm.querySelector('.cooldown')!;
        this.descDiv = elm.querySelector('.desc')!;

        this.bindingRoot = elm.querySelector('.binding')!;


        this.element!.style.pointerEvents = 'none';
        this.display = 'flex';

    }

    init() {
        this.enabled = false;
    }

    onEnable() {
        super.onEnable();
        this.element!.classList.add('show');
    }

    public showAbility(ability: AbilitySchema, desc?: TAbilityDesc, command?: CommandBindings) {

        this.titleDiv.innerText = toUppercase(desc?.name ?? ability.id);
        this.typeDiv.innerText = 'Type: ' + this.getTypeString(ability.type);

        this.durationDiv.innerText = timeString(ability.duration);
        this.cooldownDiv.innerText = timeString(ability.cooldown);

        this.descDiv.innerText = '';

        this.bindingRoot.querySelectorAll('.binding_input').forEach(v =>
            v.remove()
        );

        const bindings = command?.bindings;
        if (bindings && bindings.length > 0) {

            for (let i = 0; i < bindings.length; i++) {

                const binding = bindings[i];
                if (binding) {

                    this.bindingRoot.appendChild(
                        this.makeTextElement(
                            binding.toString() + (binding.type === 'keydown' ? ' Key' : ''),
                            'binding_input')
                    );
                }

            }

        }

    }

    private makeTextElement(text: string, cls: string) {

        const elm = document.createElement('div');
        elm.innerText = text;
        elm.classList.add(cls);

        return elm;

    }

    private getTypeString(type: TAbilityType) {

        if (type === 'trigger') {
            return 'Activate';
        } else if (type === 'aim') {
            return 'Aimed';
        } else if (type === 'passive') {
            return 'Passive';
        }
        return '';

    }


}