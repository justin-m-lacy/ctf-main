export enum ChannelType {
    Match,
    Team,
    Viewers
}

/**
 * Manages chat connections to server.
 */
export class Chat {

    readonly activeChannels: Map<ChannelType, any> = new Map();

    constructor() {
    }

    getChatId(type: ChannelType) {
        return this.activeChannels.get(type)?.id;
    }
    getChannel(type: ChannelType) {
        return this.activeChannels.get(type);
    }
    /**
     * Clear all channels.
     */
    clearAll() {
        this.activeChannels.clear();
    }

    clearChannel(type: ChannelType) {
        this.activeChannels.delete(type);
    }

    setChannel(type: ChannelType, chan: any) {
        this.activeChannels.set(type, chan);
    }

    setMatchChannel(chan: any) {
        this.activeChannels.set(ChannelType.Match, chan);
    }

}