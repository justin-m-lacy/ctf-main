import { Group } from 'gibbon.js';
import { ClientGame } from '@/client-game';
import { AppEvent } from '../model/app-events';
export class LobbyGroup extends Group<ClientGame> {


    onAdded() {

        this.game!.dispatcher.addListener(AppEvent.JoinedLobby, this.onJoin, this);
        this.game!.dispatcher.addListener(AppEvent.LeftLobby, this.onLeave, this);
        this.game!.dispatcher.addListener(AppEvent.LobbyError, this.onLobbyError, this);

    }

    onJoin() {

    }


    onLeave() {

        this.destroy();
        this.game!.removeGroup(this);

    }


    onRemoved() {

        this.game!.dispatcher.removeListener(AppEvent.JoinedLobby, this.onJoin, this);
        this.game!.dispatcher.removeListener(AppEvent.LeftLobby, this.onLeave, this);
        this.game!.dispatcher.removeListener(AppEvent.LobbyError, this.onLobbyError, this);

    }

    onLobbyError(err: any) {
        console.log(`error in lobby: ${err}`);
        console.dir(err);
    }

    onDestroy() {

    }
}