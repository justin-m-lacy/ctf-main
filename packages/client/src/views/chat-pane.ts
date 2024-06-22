import { AppEvent } from '@model/app-events';
import { HtmlWrapper } from 'gibbon.js';
import { MatchChat } from '../../../server/src/messages/chat-events';

export class ChatPane extends HtmlWrapper {

    private formElm: HTMLFormElement;
    private fldInput: HTMLInputElement;
    private chatDisplay: HTMLTextAreaElement;

    constructor() {

        super('paneChat');

        const elm = this.element!;

        this.formElm = elm.querySelector('#formChat') ?? new HTMLFormElement();
        this.fldInput = elm.querySelector('#fldChatInput') ?? new HTMLInputElement();
        this.chatDisplay = elm.querySelector('#chatTextArea')!;

    }

    init() {

        super.init?.();

        this.formElm.addEventListener('submit', (e) => this.onSubmit(e));

    }

    toggleVisible() {
        this.enabled = !this.enabled;
    }

    onEnable() {
        //console.log(`chat pane enable()`);
        if (this.actor) {
            this.actor.active = true;
        }
        super.onEnable();
    }
    onDisable() {
        //console.log(`chat pane disable()`);
        if (this.actor) {
            this.actor.active = false;
        }
        super.onDisable();
    }

    onSubmit(e: Event) {

        e.preventDefault();
        e.stopPropagation();
        const text = this.fldInput.value.trim();
        this.fldInput.value = '';
        if (text != '') {
            this.actor!.emit(AppEvent.SendChat, text);
        }
    }


    onChatEvent(data: MatchChat) {
        this.chatDisplay.textContent += `\n${data.from}: ${data.message}`;
    }

    /*onPmEvent(data: EventPm) {

        this.chatDisplay.value += `\n${data.from}: ${data.msg}`;
    }*/

    onDestroy() {

        this.formElm.removeEventListener('submit', this.onSubmit);
        super.onDestroy();
    }

}