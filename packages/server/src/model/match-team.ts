export class MatchTeam {

    /// Currently equal to team's group.id
    readonly teamId: string;
    readonly teamName: string;

    private readonly players: string[] = [];

    public get size() {
        return this.players.length;
    }

    constructor(id: string) {

        this.teamId = id;
        this.teamName = '';

    }

    addPlayer(id: string) {
        if (this.players.indexOf(id) < 0) {
            this.players.push(id);
        }
        return this.teamId;
    }

    removePlayer(id: string) {
        const ind = this.players.indexOf(id);

        if (ind >= 0) {
            this.players.splice(ind, 1);
        }

    }

}