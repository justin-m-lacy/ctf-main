import { Tween, Group as TweenGroup } from 'tweedle.js';

type Props<T> = {

    target: T,
    to: any,
    time: number,
    reverseTime?: number,
    from?: any,
    group?: TweenGroup,
    safetyCheck?: (obj: T) => boolean,
    onComplete?: (obj: T, t: Tween<T>) => void,
    onReverse?: (obj: T, t: Tween<T>) => void
}

/**
 * Encapsulates tween start and reverse.
 */
export class ReverableTween<T> {

    private _in: Tween<T>;
    private _out: Tween<T>;

    constructor(props: Props<T>) {

        const target: T = props.target;

        this._in = new Tween<T>(target, props.group).to(props.to, props.time);
        this._out = new Tween(target, props.group).to(
            props.from ?? this.makeReverseTo(target, props.to),
            props.reverseTime ?? props.time);

        if (props.onComplete) {
            this._in.onComplete(props.onComplete);
        }
        if (props.onReverse) {
            this._out.onComplete(props.onReverse);
        }
        if (props.safetyCheck) {
            this._in.safetyCheck(props.safetyCheck);
            this._out.safetyCheck(props.safetyCheck);
        }
    }

    /**
     * Use current properties of target as the reverse targets.
     * @param t 
     * @param to 
     */
    private makeReverseTo(t: T, to: any) {

        const out: any = {};
        let k: keyof T;
        // @ts-ignore
        for (k in to) {
            out[k] = t[k];
        }

        return out;
    }

    start() {

        this._out.stop();
        this._in.start();
    }

    reverse() {

        this._in.stop();
        this._out.start();
    }

    /**
     * Stop both forward and reverse.
     */
    stop() {

        this._in.stop();
        this._out.stop();

    }

    destroy() {

        this._in.stop();
        this._out.stop();

    }
}