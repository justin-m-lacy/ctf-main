export type ClientChat = {
    message: string;
    from: string,
    team?: string,
    to?: string
}

export type RoomChat = {
    /// from probably not required.
    from: string;
    message: string;
}

export type MatchChat = {
    /// Team should be inferred by the user?
    from: string;
    team?: string;
    to?: string;
    message: string;
}

export type PmChat = {
    /// Team should be inferred by the user?
    from: string;
    to: string;
    message: string;
}