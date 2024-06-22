import { Client, Room } from "colyseus";
import { CtfMatch } from '../ctf/ctf-match';
import { CtfSchema } from "../model/schema/ctf-schema";
import { onClientChat } from '../handlers/chat-events';
import { MessageType } from "../messages/message-types";
import { UserData } from '../model/user-data';
import { PlayerSchema } from '../model/schema/player-schema';
import fs from 'fs';
import { resolve } from "path";
import { makeCtfSchema, MapData, parseMapData } from '../ctf/data/parser';
import { ClientChat } from '../messages/chat-events';
import { abilities } from '../../assets/abilities.json';
import { TAbilityDef } from '../ctf/data/ability';
import { TCraft } from "src/ctf/data/craft-type";
import { crafts } from '../../assets/crafts.json';

/*const waitCrafts: Promise<{ crafts: TCraft[] }> = fs.promises.readFile(
    process.env.ASSETS_DIR ?? '../assets/crafts.json', 'utf8').then((v) => JSON.parse(v))*/

const TickMs: number = 16.6;

/**
 * Client update rate in milliseconds.
 */
const PatchRate: number = 50;
export class CtfRoom extends Room<CtfSchema> {

    match!: CtfMatch;

    getAbilityTypes() { return abilities as TAbilityDef[] }
    getCraftTypes() { return this.crafts! }

    private crafts?: TCraft[];

    /**
     * Current map data.
     */
    private mapData?: MapData;
    public getMapData() { return this.mapData; }

    async onCreate(options: any) {

        this.setPatchRate(PatchRate);
        this.setMetadata({

        });

        // console.log(`map die: ${resolve(process.cwd(), "assets/maps/trow-lg.json")}`);

        const mapText = fs.readFileSync(resolve(process.cwd(), "assets/maps/trow-lg.json"), 'utf-8');
        if (!mapText) {
            throw new Error(`failed to load game map.`);
        }
        this.mapData = parseMapData(mapText);

        const schema = makeCtfSchema(this.mapData);
        schema.patchRate = PatchRate;


        this.clock.start();
        this.crafts = crafts;


        this.setState(schema);
        this.match = new CtfMatch(
            this,
            this.state
        );

        this.onMessage(MessageType.ClientChat, (client: Client, chat: ClientChat) => {
            onClientChat(this, client, chat);
        });

        this.onMessage(MessageType.Ping, (client) => {
            client.send(MessageType.Ping, {});
        });

        this.setSimulationInterval((deltaMs) => {

            this.match.update(deltaMs / 1000);

        }, TickMs);

    }

    /**
     * Send map data to client.
     */
    public sendMap(mapData: MapData, clientId: string) {

    }

    /**
     * Get client by id.
     * @param id 
     * @returns 
     */
    getClient(id: string) {
        for (let i = this.clients.length - 1; i >= 0; i--) {
            if (this.clients[i].id === id) {
                return this.clients[i];
            }
        }
        return null;
    }

    onJoin(client: Client, options: any, auth?: UserData) {

        console.log(`Client joined: ${client.id} ${client.auth}`);

        const p = new PlayerSchema(
            {
                id: client.id,
                name: auth?.name ?? client.id,
                maxHp: this.state.params.baseHp,

            });


        //client.send(MessageType.MatchTime, { time: this.clock.currentTime });
        this.match.onPlayerJoin(client.id, p);

        client.send(MessageType.MapData,
            {
                map: this.mapData,
                serverTime: this.clock.currentTime,
            });

    }

    /**
     * If onAuth() returns a truthy value, onJoin() is going to be called with the returned value * * as the third argument.
     * Return false value to immediately reject connection.
     * May also throw a ServerError to expose an error to be handled in the client-side.
     
    * @param client 
    * @param auth 
    */
    onAuth(client: Client, auth: any) {

        console.log(`player auth: ${client.id} ${client.auth} userData:`);
        console.dir(client.userData);

        if (auth) {
            console.log(`auth options:`);
            console.dir(auth);
            auth.id = client.id;
        }

        return auth ?? true;

    }

    onLeave(client: Client, consented?: boolean) {

        console.log(`Client left: ${client.id}  consented: ${consented}`);
        this.match.onPlayerLeft(client.id);
    }

    onDispose() {

        console.log(`CtfRoom Dispose.`);
        this.match?.destroy();
    }

}