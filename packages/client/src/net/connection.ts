import * as Colyseus from 'colyseus.js';
import { Room } from 'colyseus.js';
import type { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import type { UserData } from '../../../server/src/model/user-data';
import { ActiveMatch } from './active-match';
import { RoomName } from '../../../server/src/rooms/room-names';
import { ColyseusUser } from './colyseus-user';
import { AppEvent } from '../model/app-events';
import { Dispatcher } from '@/dispatcher';


export class Connection {

    private client: Colyseus.Client;

    //private room?: Colyseus.Room<CtfSchema>;

    private _activeMatch: ActiveMatch | null = null;
    public get activeMatch() { return this._activeMatch; }

    /**
     * All rooms available.
     */
    private availableRooms?: Colyseus.RoomAvailable<any>[];

    private _user?: ColyseusUser;

    /**
     * User in process of joining. Prevents multi join attempts.
     */
    private _joining: boolean = false;

    /**
     * Handles dispatching events to game.
     */
    private dispatcher: Dispatcher;

    public getUser() {
        return this._user;
    }

    /**
     * 
     * @param dispatcher
     */
    constructor(dispatcher: Dispatcher) {

        this.dispatcher = dispatcher;
        this.dispatcher.on(AppEvent.SendChat, this.onLocalChat, this);

        this.client = new Colyseus.Client(this.getServerUri());

        //this._user = new ColyseusUser(auth);

        this.client.auth.token
    }

    async tryLogin() {

        console.log(`try login:`);

        const result = await this.client.auth.signInAnonymously();

        console.log(`login result: ${result}`);

        //console.log(`login result: ${result._id}`);
        this._user?.setAuth(this.client.auth);


    }

    public onLocalChat(text: string, to?: string) {
        this._activeMatch?.sendChat(text);
    }

    /**
     * Join an existing room. No create.
     * @param available 
     */
    public async joinAvailable(available: Colyseus.RoomAvailable, info?: UserData) {

        if (this._joining || this.activeMatch) {
            return;
        }
        try {

            this._joining = true;

            this.dispatcher.emit(AppEvent.JoiningMatch);
            const room = await this.client.joinById<CtfSchema>(available.roomId, info);
            if (room) {
                this.initMatchRoom(room);
            }

        } catch (err) {
            console.error(err);
            this.destroyActiveMatch();

            this.dispatcher.emit(AppEvent.JoinFailed, err);

        } finally {
            this._joining = false;
        }

    }

    /**
     * Join an existing room. No create.
     * @param available 
     */
    public async createNewMatch(info?: UserData) {

        if (this._joining || this.activeMatch) {
            return;
        }
        try {

            this._joining = true;

            this.dispatcher.emit(AppEvent.JoiningMatch);
            const room = await this.client.create<CtfSchema>(RoomName.Ctf, info)
            if (room) {
                this.initMatchRoom(room);
            }

        } catch (err) {
            console.error(err);
            this.destroyActiveMatch();

            this.dispatcher.emit(AppEvent.JoinFailed, err);

        } finally {
            this._joining = false;
        }

    }

    /**
     * Join or create a game match.
     */
    public async joinOrCreateMatch(info?: UserData) {

        if (this._joining) {
            return;
        }
        try {

            this._joining = true;

            this.dispatcher.emit(AppEvent.JoiningMatch);
            const room = await this.client.joinOrCreate<CtfSchema>(RoomName.Ctf, info);

            //console.log(`room session id: ${room.sessionId} serializerId ${room.serializerId}`);
            this.initMatchRoom(room);

        } catch (err: any) {

            console.error(err);
            this.destroyActiveMatch();
            this.dispatcher.emit(AppEvent.JoinFailed, err);


        } finally {
            this._joining = false;
        }

    }

    /**
     * 
     */
    public async fetchAvailableRooms() {

        console.log(`fetching available rooms.`)
        const available = await this.client.getAvailableRooms();

        return this.setRoomsAvailable(available);

    }

    public async connect() {

        try {

            const room = await this.client.joinOrCreate<any>(RoomName.Lobby);

            //console.log(`joined lobby. auth id: ${this.client.auth._id}`);
            this._user?.setAuth(this.client.auth);

            this.initLobby(room);

            console.log(`joined lobby: ${room.id}: name: ${room.name}`)
            /*for (const p in room.state) {
                console.log(`room prop: ${p}: ${room.state[p]}`);
            }*/

        } catch (err: any) {

            console.warn(`lobby error`);
            console.dir(err);

        }


    }

    private setRoomsAvailable(available: Colyseus.RoomAvailable[]) {

        for (const room of available) {
            console.log(`Room available: ${room.roomId}`);
            if (room.metadata) {
                for (const k in room.metadata) {
                    console.log(`room meta: ${k}: ${room.metadata[k]}`)
                }
            }
        }

        this.availableRooms = available;

        return available;


    }

    private initLobby(lobby: Room) {

        lobby.onMessage("rooms", (rooms: Colyseus.RoomAvailable[]) => {
            for (const r of rooms) {
                console.log(` ${r.roomId}: ${r.metadata}`);
            }
            this.setRoomsAvailable(rooms);
        });

        lobby.onMessage("+", ([roomId, room]: [string, Colyseus.RoomAvailable]) => {
            if (this.availableRooms) {
                const roomIndex = this.availableRooms.findIndex((room) => room.roomId === roomId);
                if (roomIndex !== -1) {
                    // room updated with new data.
                    this.availableRooms[roomIndex] = room;

                } else {
                    this.availableRooms.push(room);
                }
            }
        });

        lobby.onMessage("-", (roomId: string) => {
            this.availableRooms = this.availableRooms?.filter((room) => room.roomId !== roomId);
        });

        lobby.onLeave((code: number) => {
            console.log(`left lobby. code: ${code}`);
        })
        lobby.onError((code, message) => {
            console.log(`lobby error: ${code} ${message}`);
        })
    }

    private initMatchRoom(room: Room<CtfSchema>) {

        this._activeMatch = new ActiveMatch(this._user!);
        this._activeMatch.setRoom(room);

        room.onLeave((code) => {
            console.log(`Leave room. Code: ${code}`);
            this.dispatcher.emit(AppEvent.MatchLeft);
            this.destroyActiveMatch();
        });

        this.dispatcher.emit(AppEvent.MatchJoined, this._activeMatch);

    }

    private destroyActiveMatch() {
        this._activeMatch?.destroy();
        this._activeMatch = null;
    }

    private getServerUri() {

        const host = import.meta.env.VITE_SERVER_HOST;
        const port = import.meta.env.VITE_SERVER_PORT;

        if (import.meta.env.PROD) {

            console.log(`using secure websockets`);
            return `wss://${host}:${port}`;
        } else {
            console.log(`use insecure websocket`);
            return `ws://${host}:${port}`;

        }


    }

    on(evt: AppEvent, fn: (...args: any[]) => void, context: object) {
        return this.dispatcher.on(evt, fn, context);
    }

}