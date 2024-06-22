import Group from '../../engine/group';
import { MessageType } from '../../messages/message-types';
import { CtfRoom } from 'src/rooms/ctf-room';
import { CtfMatch } from 'src/ctf/ctf-match';
import { CtfSchema } from 'src/model/schema/ctf-schema';
import { ClientCraftSelect } from '../../messages/client-messages';
import { TCraft } from '../data/craft-type';
import { InternalEvent } from '../data/consts';
import { Player } from '../components/player/player';
import { quickSplice } from '../../engine/utils/array-utils';
import { AbilitySystem } from './ability-system';
import { BASE_SPEED } from '../../model/schema/types';

export class ServerCharSelect extends Group<CtfMatch> {

    private readonly match: CtfMatch;
    private readonly state: CtfSchema;

    private readonly crafts: TCraft[];

    /**
     * Crafts not yet assigned to a user.
     * TODO: free crafts by team?
     */
    private readonly freeCrafts: string[];

    private abilitySys!: AbilitySystem;

    constructor(match: CtfMatch) {

        super();

        this.match = match;

        this.state = match.state;

        this.crafts = match.room.getCraftTypes();
        this.freeCrafts = this.crafts.map(v => v.id);

    }

    onAdded() {


        this.abilitySys = this.game!.getGroup(AbilitySystem)!;

        this.addRoomEvents(this.match.room);

        this.match.on(
            InternalEvent.PlayerSpawned, this.onPlayerSpawn, this);
    }

    private onPlayerSpawn(player: Player) {

        /**
         * Assign craft and abilities.
         */
        const craft = this.uniqueCraft();
        this.swapCraft(player, craft);
        player.schema.hp = player.schema.maxHp;

    }

    private addRoomEvents(room: CtfRoom) {

        room.onMessage(MessageType.ClientCharSelect, (client, message: ClientCraftSelect) => {

            const player = this.match.players.get(client.id);

            if (player) {

                if (player.schema.craft != message.craft) {

                    const team = this.state.teams.get(player.teamId);
                    if (team?.inSpawnRegion(player.schema.pos)) {

                        const craftId = message.craft;
                        const craft = this.crafts.find(v => v.id === craftId);
                        if (craft) {
                            this.swapCraft(player, craft);
                        }

                    }

                }

            }

        });
    }

    private swapCraft(player: Player, craft: TCraft) {

        const craftId = craft?.id ?? '';

        if (player.schema.craft != craftId) {

            player.schema.craft = craftId;

            player.schema.maxHp = craft.stats?.maxHp ?? this.state.params.baseHp;
            if (player.schema.hp > player.schema.maxHp) player.schema.hp = player.schema.maxHp;
            player.schema.motion.maxSpeed = craft.stats?.maxSpeed ?? BASE_SPEED;

            this.abilitySys.swapCraft(player, craft);
            this.match.emit(InternalEvent.CraftChanged, player, craft);

            if (craftId && !this.freeCrafts.includes(craftId)) {
                this.freeCrafts.push(craftId);
            }

            //player.schema.triggerAll();

        }


    }

    /**
     * Attempt to find unused craft.
     */
    private uniqueCraft() {

        if (this.freeCrafts.length > 0) {

            const ind = Math.floor(Math.random() * this.freeCrafts.length);
            const craftId = this.freeCrafts[ind];
            quickSplice(this.freeCrafts, ind);

            const craft = this.crafts.find(v => v.id === craftId);
            if (craft) {
                return craft;
            }
        }

        return this.crafts[Math.floor(Math.random() * this.crafts.length)];

    }

}