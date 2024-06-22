import { IUser } from '../model/user';
import { Auth } from 'colyseus.js';

export type TUserData = {
    displayName?: string,
    username: string
}
export class ColyseusUser implements IUser {

    // private _auth: Auth

    name = '';
    id = 'id';

    constructor() {

    }

    setAuth(auth: Auth) {
        // this._auth = auth;
        console.log(`setAuth: id: ${auth} token: ${auth.token}`);
    }

    async setInfo(name: string) {

    }


}