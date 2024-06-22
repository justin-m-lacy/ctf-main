import { ClientGame } from '@/client-game';
import { Group, TPoint } from 'gibbon.js';
import { LoaderGroup } from './loader-group';
import { MatchEvent } from '../model/match-events';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import type { IActiveMatch } from '../model/iactive-match';
import type { TeamSchema } from '../../../server/src/model/schema/team-schema';
import type { AbilityKey } from '../../../server/src/ctf/systems/ability-system';
import { AbilitySchema, AbilityState } from '../../../server/src/model/schema/data/ability-schema';
import { FlagState } from '../../../server/src/model/schema/flag-schema';
import { BulletSchema } from '../../../server/src/model/schema/bullet-schema';
import { BodyType, PlayerState, ShotType } from '../../../server/src/model/schema/types';
import type { BodySchema } from '../../../server/src/model/schema/body-schema';
import type { Howl } from 'howler';
import { ActiveAudio } from '../model/active-audio';

export enum AudioEvent {

    Died = 'died',
    Scored = 'matchscored',

    /**
     * Craft enters match. Might not actually be match start.
     */
    CraftEnter = 'matchenter',
    MatchStart = 'start',
    FlagDropped = 'dropflag',
    FlagTaken = 'takeflag',
    FlagReturned = 'returnflag',
    KillPlayer = 'hitenemy',
    Spawned = 'spawn',
    GameWon = 'gamewon',
    GameLost = 'gamelost'

}

/**
 * Map audio event to priority.
 */
const audioPriorities: Partial<Record<AudioEvent | AbilityKey, number>> = {

    [AudioEvent.Died]: 1000,
    [AudioEvent.Spawned]: 7000,
    [AudioEvent.Scored]: 8000,

    [AudioEvent.CraftEnter]: 4000,
    [AudioEvent.MatchStart]: 9000,
    [AudioEvent.FlagDropped]: 1000,
    [AudioEvent.FlagTaken]: 1100,
    [AudioEvent.FlagReturned]: 900,
    [AudioEvent.KillPlayer]: 800,

    [AudioEvent.GameWon]: 10000,
    [AudioEvent.GameLost]: 10000
}

const MaxAudioDist = 800
const MaxDist2 = MaxAudioDist * MaxAudioDist;
export class MatchAudio extends Group<ClientGame> {

    private assets!: LoaderGroup;
    private match!: IActiveMatch;

    private myPlayer?: PlayerSchema;

    /**
     * Running audio for each player (with priority?)
     */
    private _playing: Map<string, ActiveAudio> = new Map();

    onAdded() {

        this.assets = this.game!.assets;
        this.match = this.game!.activeMatch!;

        this.match.on(MatchEvent.PlayerState, this.onPlayerState, this);
        this.match.on(MatchEvent.PlayerKilled, this.playerKilled, this);
        this.match.on(MatchEvent.MatchStart, this.onMatchStart, this);
        this.match.on(MatchEvent.MatchEnd, this.onMatchEnd, this);

        this.match.on(MatchEvent.BulletSpawned, this.onBullet, this);
        this.match.on(MatchEvent.BodySpawned, this.bodySpawned, this);

        this.match.on(MatchEvent.AbilityState, this.onAbility, this);
        this.match.on(MatchEvent.TeamScored, this.onTeamScore, this);

        this.match.on(MatchEvent.FlagCarrier, this.onFlagCarrier, this);
        this.match.on(MatchEvent.PlayerJoin, this.onPlayerJoin, this);
        this.match.on(MatchEvent.CraftChanged, this.onCraftEnter, this);

    }

    private playerKilled(killed: PlayerSchema, by: PlayerSchema): void {

        if (by.id !== killed.id) {
            this.playCraftAudioAt(by, AudioEvent.KillPlayer, by.id !== this.myPlayer?.id ? by.pos : null);
        }

    }

    private onBullet(b: BulletSchema) {

        if (b.type !== ShotType.basic) {
            const player = this.match.getPlayer(b.player);
            this.playAudioAt(ShotType[b.type], player?.craft, b.pos);
        }

    }

    private bodySpawned(b: BodySchema) {
        this.playAudioAt(BodyType[b.type], this.match.getPlayer(b.player)?.craft, b.pos);
    }


    private onTeamScore(id: string, score: number, by: string) {

        const player = this.match.getPlayer(by);
        if (player) {
            this.playCraftAudio(player, AudioEvent.Scored);
        }

    }

    /**
     * TODO: sound falloff distance.
     * @param p 
     * @param ability 
     * @param isLocal 
     */
    private onAbility(p: PlayerSchema, ability: AbilitySchema, isLocal: boolean) {

        if (ability.id === p.primary?.id) {
            return;
        }

        switch (ability.state) {

            case AbilityState.active:
                /// todo: problem with firing abilities not actually used yet???
                this.playCraftAudio(p, ability.id, isLocal ? 1 : this.getRangeVolume(p.pos));
                break;

        }



    }

    /**
     * Get volume of an event.
     * @param pos 
     */
    private getRangeVolume(pos: TPoint) {

        const myPos = this.myPlayer?.pos;
        if (myPos) {
            const dx = pos.x - myPos.x;
            const dy = pos.y - myPos.y;
            const vol = 1 - (dx * dx + dy * dy) / MaxDist2;
            //console.log(`reducing volume ${vol}`);
            return vol;
        }
        return 0;
    }

    /**
     * Callback is only triggered on change of flag carrier.
     * This means it doesn't fire when a dropped flag is returned to base
     * since a carrier isn't assigned in that case.
     * @param team 
     * @param newPlayer 
     * @param prevPlayer 
     */
    private onFlagCarrier(team: TeamSchema, newPlayer?: string, prevPlayer?: string) {

        const state = team.flag.state;

        if (state === FlagState.dropped) {

            if (prevPlayer) {
                const dropper = this.match.getPlayer(prevPlayer);
                if (dropper) {
                    const otherPlayer = (prevPlayer !== this.myPlayer?.id);

                    this.playCraftAudioAt(dropper, AudioEvent.FlagDropped, otherPlayer ? team.flag.pos : undefined);
                }

            }

        } else if (state === FlagState.carried) {

            if (newPlayer) {
                const carrier = this.match.getPlayer(newPlayer);
                if (carrier) {
                    this.playAudioAt(AudioEvent.FlagTaken, carrier.craft, carrier === this.myPlayer ? null : team.flag.pos);
                }

            }

        } else if (state === FlagState.returned) {

            console.log(`Flag returned by: ${newPlayer}`);

            if (newPlayer) {
                const player = this.match.getPlayer(newPlayer);
                if (player && player.team == team.id) {

                    this.playCraftAudioAt(player, AudioEvent.FlagTaken, player.pos);
                }
            }

        }

    }

    private onPlayerJoin(player: PlayerSchema, isLocal: boolean) {
        if (isLocal) {
            this.myPlayer = player;
        }
    }

    private onMatchStart() {
        this.playAudioAt(AudioEvent.MatchStart, this.myPlayer?.craft);
    }

    private onMatchEnd(state: unknown, winTeam: TeamSchema) {

        if (this.myPlayer) {
            if (winTeam.id === this.myPlayer.team) {
                this.playCraftAudio(this.myPlayer, AudioEvent.GameWon);
            } else {
                this.playCraftAudio(this.myPlayer, AudioEvent.GameLost);
            }
        }

    }

    private onCraftEnter() {

        if (this.myPlayer) {
            this.playCraftAudio(this.myPlayer, AudioEvent.MatchStart);
        }
    }

    private onPlayerState(schema: PlayerSchema, state: PlayerState, prevState?: PlayerState) {

        if (state === PlayerState.dead) {

            this.playCraftAudio(schema, AudioEvent.Died)

        } else if (schema.id === this.myPlayer?.id) {

            if (state === PlayerState.disabled || prevState === PlayerState.dead) {
                this.playCraftAudio(this.myPlayer, AudioEvent.Spawned);
            }

        }

    }

    /**
     * Play audio of event, without requiring craft specific audio.
     * @param craft 
     * @param event 
     */
    private async playAudioAt(event: AudioEvent | AbilityKey, craft?: string, fade?: TPoint | null) {

        const vol = fade ? this.getRangeVolume(fade) : 1;

        /// todo: this probably sets global volume on that audio type...
        if (vol > 0) {
            // @ts-ignore
            this.assets.getEventAudio(event, craft)?.volume(vol * 0.2).play();
        }

    }

    /**
     * Play audio based on craft, without checking for default event audio.
     * @param craft 
     * @param event 
     */
    private async playCraftAudioAt(player: PlayerSchema, event: AudioEvent | AbilityKey, fade?: TPoint | null) {


        const vol = fade ? this.getRangeVolume(fade) : 1;
        /// todo: this probably sets global volume on that audio type...
        if (vol > 0) {

            const audio = this.assets.getCraftAudio(player.craft, event)?.volume(vol * 0.2) as Howl;
            if (audio) {
                this.doPlayerAudio(audio, player.id, event);
            }

        }

    }

    private getAudioPriority(event: AudioEvent | AbilityKey) {
        return audioPriorities[event] ?? 0;
    }

    /**
     * Play audio based on craft, without checking for default event audio.
     * @param craft 
     * @param event 
     * @param vol 
     */
    private async playCraftAudio(player: PlayerSchema, event: AudioEvent | AbilityKey, vol: number = 1) {

        /// todo: this probably sets global volume on that audio type...
        if (vol > 0) {
            // @ts-ignore
            const audio = this.assets.getCraftAudio(player.craft, event)?.volume(vol * 0.2) as Howl;
            if (audio) {
                this.doPlayerAudio(audio, player.id, event);
            }
        }
    }

    /**
     * Check for audio overlap before starting player audio.
     * @param audio
     * @param id - use id not string so playerschema isnt stored.
     * @param event 
     * @returns 
     */
    private doPlayerAudio(audio: Howl, id: string, event: string) {

        /// check current audio
        const priority = this.getAudioPriority(event);

        const cur = this._playing.get(id);
        if (cur) {

            if (cur.overrides(priority)) {
                audio.stop();
                return;
            } else {
                cur.replace(audio, priority);
            }

        } else {
            this._playing.set(id, new ActiveAudio(audio, priority));

        }

        audio.play();

    }

    /*private endAudio(audio: Howl, id: string) {

        const cur = this._playing.get(id);
        if (cur && cur.audio == audio) {
            this._playing.delete(id);
        }

    }*/

    /// stop all audios?
    onRemoved() {
        Howler.stop();
    }

}