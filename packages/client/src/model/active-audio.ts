import type { Howl } from 'howler';

export class ActiveAudio {

    public priority: number;

    public audio: Howl;

    get playing() {
        return this.audio.playing();
    }

    constructor(audio: Howl, priority: number = 0) {

        this.audio = audio;

        this.priority = priority;

    }

    public overrides(priority: number) {
        return this.audio.playing() && this.priority >= priority;
    }

    public stop() {
        this.audio.stop();
    }

    public replace(audio: Howl, priority: number = 0) {

        this.audio.stop();

        this.audio = audio;
        this.priority = priority;

    }

}