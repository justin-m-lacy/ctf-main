const MAX_SAMPLES = 5;

export class Latency {

    /**
     * Local timestamp of when server began match.
     * This is the local time of when the server _actually_
     * started (rather than local game start.)
     */
    private serverStart: number = 0;

    /**
     * estimated delay in seconds.
     */
    private delay: number = 0.2;

    private samples: number[] = [];

    private delaySum: number = 0;

    /**
     * Get estimated milliseconds since match began
     * on server.
     */
    public getServerTime() {

        return Date.now() - this.serverStart;
    }

    /**
     * Set number of milliseconds since server started.
     * @param ms 
     */
    public setServerStart(ms: number) {
        this.serverStart = Date.now() - ms;
    }

    /**
     * Add a rtt sample.
     * @param rtt
     */
    public addRtt(rtt: number) {

        if (rtt <= 0) {
            console.error(`Invalid rtt: ${rtt}`);
            return;
        }
        rtt = 0.5 * rtt;

        this.delaySum += rtt;

        this.samples.push(rtt);
        if (this.samples.length > MAX_SAMPLES) {
            this.delaySum -= this.samples.shift()!;
        }

        this.delay = (this.delaySum / this.samples.length) / 1000;

    }

    public getDelay() { return this.delay; }

    /**
     * Estimate lag in milliseconds
     */
    public getRtt() {
        return 2 * this.delay;
    }


}