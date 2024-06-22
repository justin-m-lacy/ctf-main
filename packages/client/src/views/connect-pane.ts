import { HtmlWrapper } from 'gibbon.js';
import { CommandKey } from '../input/commands';
import { AppEvent } from '../model/app-events';


export default class ConnectPane extends HtmlWrapper {

    private readonly _nameInput: HTMLInputElement;


    private readonly _formElm: HTMLFormElement;

    private readonly _btnJoin: HTMLInputElement;
    private readonly _btnNewGame: HTMLInputElement;
    private readonly _btnSettings: HTMLInputElement;

    private _joinListener?: (e: Event) => void;
    private _newGameListener?: (e: Event) => void;
    private _settingsListener?: (e: Event) => void;

    constructor() {

        super('paneConnect');

        this._formElm = this.element!.querySelector('#formConnect')!;

        this._nameInput = this._formElm.querySelector('#fldName')!;
        this._btnJoin = this._formElm.querySelector('#btnJoin')!;
        this._btnNewGame = this._formElm.querySelector('#btnNewGame')!;
        this._btnSettings = this._formElm.querySelector('#btnSettings')!;


    }

    init() {

        super.init?.();

        this._joinListener = (e) => this.onJoin(e);
        this._newGameListener = (e) => this.onNewGame(e);
        this._settingsListener = (e) => this.onSettings();

        this._btnJoin.addEventListener('click', this._joinListener);
        this._btnNewGame.addEventListener('click', this._newGameListener);
        this._btnSettings.addEventListener('click', this._settingsListener);

        this.game!.on(CommandKey.Settings, this.close, this);
        //this._nameInput.addEventListener('input', this._);

    }

    private onLogin() {

        this.game.emit(AppEvent.TryLogin);

    }

    private close() {
        if (this.enabled) {
            this.enabled = false;
        }
    }

    public setBusy(b: boolean = true) {
        if (b) {
            this._btnJoin.disabled = true;
            this._btnNewGame.disabled = true;
        } else {
            this._btnJoin.disabled = false;
            this._btnNewGame.disabled = false;
        }
    }

    onSettings() {
        this.game!.emit(CommandKey.Settings);
    }

    onEnable() {
        if (this.actor) {
            this.actor.active = true;
        }
        this.setBusy(false);
        super.onEnable();
    }
    onDisable() {
        if (this.actor) {
            this.actor.active = false;
        }
        this.game!.off(CommandKey.Settings, this.close, this);
        super.onDisable();
    }

    onNameInput() {

    }

    onJoin(e: Event) {

        /// todo: put button into busy mode.
        e.preventDefault();

        if (this._btnJoin.disabled) {
            console.log(`Join disabled`);
            return;
        }
        this.setBusy(true);
        this.actor?.emit('joinClicked', this._nameInput.value);

    }

    onNewGame(e: Event) {

        /// todo: put button into busy mode.
        //e.preventDefault();
        this.setBusy(true);
        this.actor?.emit('newGameClicked', this._nameInput.value);

    }

    onDestroy() {

        this._nameInput.removeEventListener('input', this.onNameInput);

        if (this._joinListener) {
            this._btnJoin.removeEventListener('click', this._joinListener);
        }
        if (this._newGameListener) {
            this._btnNewGame.removeEventListener('click', this._newGameListener);
        }
        if (this._settingsListener) {
            this._btnSettings.removeEventListener('click', this._settingsListener);
        }

        this._settingsListener = undefined;
        this._joinListener = undefined;
        this._newGameListener = undefined;

        this._formElm.remove();

        super.onDestroy();
    }
}