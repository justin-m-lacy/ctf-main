import { LobbyRoom, Server } from "colyseus";

import http from "http";
import https from 'https';

import express from 'express';
import { WebSocketTransport } from '@colyseus/ws-transport';

import { CtfRoom } from './rooms/ctf-room';
import { RoomName } from "./rooms/room-names";
import * as fs from 'fs';

import * as dotenv from 'dotenv';
import * as path from 'path';

console.log(`CWD: ${process.cwd()}`);
console.log(`MODE: ${process.env.NODE_ENV}`);

dotenv.config({
    path: process.env.ENV_FILE ? path.resolve(process.cwd(), process.env.ENV_FILE) : undefined
});

const isSecure = process.env.NODE_ENV === 'production';

const port = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;

/// Create express routing.
const app = express();
app.use(express.json());


app.get('/test', (req, res) => {
    /// Test server up path.
    console.log(`incoming req: ${req.body}`);
    res.send(`Server mode: ${process.env.NODE_ENV}`);
});



const server = isSecure ? secureServer(app) : basicServer(app);

const gameServer = new Server({

    transport: new WebSocketTransport({
        server: server,
    })
});

gameServer.onShutdown(() => console.log(`Ctf Server shutting down.`));



if (process.env.NODE_ENV === 'development') {
    gameServer.simulateLatency(200);
}

gameServer.define(RoomName.Lobby, LobbyRoom);
gameServer.define(RoomName.Ctf, CtfRoom);
gameServer.listen(port);

console.log(`server Listening: ${isSecure ? 'https' : 'http'} on Port: ${port}`);


function secureServer(app: express.Express) {

    console.log(`creating https server`);

    const certPath = process.env['CERT_PATH'] ?? './secure/server.cert';
    const keyPath = process.env['KEY_PATH'] ?? './secure/server.key';

    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);

    return https.createServer({ key: key, cert: cert }, app,)
}

function basicServer(app: express.Express) {
    console.log(`creating basic server.`);
    return http.createServer();
}