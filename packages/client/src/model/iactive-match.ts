import type { ServerEvents } from './match-events';
import type EventEmitter from 'eventemitter3';
import { IUser } from './user';
import { EventNames } from 'eventemitter3';
import { TPoint } from 'gibbon.js';
import { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { Latency } from '../net/latency';

/**
 * Handles active game.
 */
export interface IActiveMatch {

    // Get current match state.
    getState(): CtfSchema;

    get localPlayerId(): string | null;

    getUser(): IUser;

    sendMove(to: TPoint): void;

    sendCancelCharge(): void;

    sendFireAt(at: TPoint): void;

    sendUsePrimary(at: TPoint): void;

    sendUseAbility(msg: { id: string, at?: TPoint }): void;

    leaveMatch(): void;

    getLatency(): Latency;

    /**
     * Get estimated single trip delay from server to client.
     */
    getDelay(): number;

    getPlayer(id?: string): PlayerSchema | undefined;

    once<T extends EventNames<ServerEvents>>(evt: T, fn: EventEmitter.EventListener<ServerEvents, T>, context: any): IActiveMatch;

    on<T extends EventNames<ServerEvents>>(evt: T, fn: EventEmitter.EventListener<ServerEvents, T>, context: any): IActiveMatch;

    off<T extends EventNames<ServerEvents>>(evt: T, fn?: EventEmitter.EventListener<ServerEvents, T>, context?: any): IActiveMatch;


}