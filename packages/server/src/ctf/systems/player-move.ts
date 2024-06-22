import System from "../../engine/system";
import { MessageType } from '../../messages/message-types';
import { CtfSchema } from '../../model/schema/ctf-schema';
import { PlayerState } from "../../model/schema/types";
import { CtfRoom } from "../../rooms/ctf-room";
import { CtfMatch } from '../ctf-match';
import { Player } from "../components/player/player";
import { InternalEvent } from '../data/consts';
import { FireTarget } from "../components/player/fire-target";
import { ClientDest } from '../../messages/client-messages';
import Group from '../../engine/group';

export class MoveSystem extends Group<CtfMatch> {

    private readonly match: CtfMatch;
    private readonly state: CtfSchema;

    private readonly targeters: Map<string, FireTarget> = new Map();

    constructor(match: CtfMatch) {

        super();

        this.match = match;

        this.state = match.state;


        this.addRoomEvents(match.room);
        this.match.on(
            InternalEvent.PlayerSpawned, this.onPlayerSpawn, this);
        this.match.on(InternalEvent.PlayerLeft, this.onPlayerLeft, this);

    }

    private onPlayerSpawn(player: Player) {

        const target = player.require(FireTarget, this.state.params);
        this.targeters.set(player.id, player.add(target));
        target.enabled = false;
    }

    private onPlayerLeft(id: string,) {
        this.targeters.delete(id);
    }

    private addRoomEvents(room: CtfRoom) {

        room.onMessage(MessageType.ClientDest, (client, message: ClientDest) => {

            const schema = this.state.players.get(client.id);
            if (!schema) { return; }
            if (schema.state === PlayerState.movable || schema.state === PlayerState.firing) {

                const targeter = this.targeters.get(client.id);
                if (targeter) {

                    targeter.enabled = false;
                    /// TODO: separate player move system?
                    targeter.setMoveDest(message.to);

                } else {
                    console.log(`error: no targeter.`);
                }
            }

        });

        /// Note: confirmed; callback does not trigger server-side.
        ///room.state.players.onRemove = (item: PlayerSchema);

    }

}