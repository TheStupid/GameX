import EventDispatcher from "../../egret/events/EventDispatcher";
import TimerEvent from "../events/TimerEvent";

export default class Timer extends EventDispatcher {

    private _delay: number = 0;
    private _repeatCount: number = 0;
    private _currentCount: number = 0;
    private _running: boolean = false;

    public constructor(delay: number, repeatCount: number = 0) {
        super();
        this._delay = delay;
        this._repeatCount = repeatCount;
    }

    /**
     * 计时器从 0 开始后触发的总次数。
     */
    public get currentCount(): number {
        return this._currentCount;
    }

    /**
     * 设置的计时器运行总次数。如果重复计数设置为 0，则计时器将持续不断运行，或直至调用了 stop() 方法或节目停止。如果重复计数不为 0，则将运行计时器，运行次数为指定的次数。如果设置的 repeatCount 总数等于或小于 currentCount，则计时器将停止并且不会再次触发。
     */
    public get repeatCount(): number {
        return this._repeatCount;
    }

    /**
     * 计时器的当前状态；如果计时器正在运行，则为 true，否则为 false。
     */
    public get running(): boolean {
        return this._running;
    }

    /**
     * 计时器事件间的延迟（以毫秒为单位）。如果在计时器正在运行时设置延迟间隔，则计时器将按相同的 repeatCount 迭代重新启动。
     */
    public get delay(): number {
        return this._delay;
    }

    public set delay(value:number) {
        this._delay=value;
        if (this._running) {
            this.reset();
            this.start();
        }
    }

    /**
     * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。然后，在调用 start() 后，将运行计时器实例，运行次数为指定的重复次数（由 repeatCount 值设置）。
     */
    public reset(): void {
        this.stop();
        this._currentCount = 0;
    }

    /**
     * 如果计时器尚未运行，则启动计时器。
     */
    public start(): void {
        if (this._running) return;
        this._running = true;
        Laya.timer.loop(this.delay, this, this.update);
    }

    /**
     * 停止计时器。如果在调用 stop() 后调用 start()，则将继续运行计时器实例，运行次数为剩余的 重复次数（由 repeatCount 属性设置）。
     */
    public stop(): void {
        if (!this._running) return;
        this._running = false;
        Laya.timer.clear(this, this.update);
    }

    private update(): void {
        this._currentCount++;
        this.dispatchEvent(new TimerEvent(TimerEvent.TIMER));
        if (this.repeatCount > 0 && this._currentCount >= this.repeatCount) {
            this.stop();
            this.dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE));
        }
    }
}