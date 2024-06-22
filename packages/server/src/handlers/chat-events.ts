import { Client } from 'colyseus';
import { CtfRoom } from '../rooms/ctf-room';
import { ClientChat } from '../messages/chat-events';
import { MessageType } from '../messages/message-types';


export const onClientChat = (room: CtfRoom, client: Client, evt: ClientChat) => {

    const player = room.state.players.get(client.id);
    if (!player) {
        return;
    } else if (evt.from !== client.id) {
        console.log(`bad chat sender: ${evt.from} expected: ${client.id}`);
    }

    console.log(`client message: ${evt.message}`);
    /**
     * Don't exclude current client so client knows the server recieved message.
     */

    if ('team' in evt) {

        /// Check player team matches message team.
        if (player.team !== evt.team) {
            console.log(`Player team does not match message team.`);
            return;
        }


        /// Team chat: todo: only to team member clients.
        room.broadcast(MessageType.MatchChat, evt);


    } else {


        room.broadcast(MessageType.MatchChat, evt);

    }

}