import DateUtil from "../../util/DateUtil";

export default class TimeReader {
    private static readonly DefaultIntervalMs: number = 50;

    private _intervalMs: number = TimeReader.DefaultIntervalMs;
    private _leftMs: number = 0;
    private _isPause: boolean = true;
    private _lastRecordTime: number = 0;
    private _unitMs: number = DateUtil.SECOND_MS;
    /**
     * autoStart:是否自动开始，默认=false
     * unitMs:读取单位,每次读取的单位数，毫秒为单位，默认是1000毫秒
     * intervalMs:检查间隔，可以提高精度。
     * */
    constructor(autoStart?: boolean, unitMs?: number, intervalMs?: number) {
        this.init();
        if (intervalMs != null) {
            this._intervalMs = intervalMs;
        }
        if (autoStart) {
            this.reStart();
        }
        if (unitMs) {
            this._unitMs = unitMs;
        }
    }

    private init(): void {
        Laya.timer.loop(this._intervalMs, this, this.onTimer);
    }

    private onTimer(): void {
        if (this._isPause) {
            return;
        }
        this.addTime();
    }

    private addTime(): void {
        let now: number = DateUtil.getServerTimeInMS;
        this._leftMs += (now - this._lastRecordTime);
        this._lastRecordTime = now;
    }

    reStart(): void {
        this._leftMs = 0;
        this.resume();
    }

    resume(): void {
        this._isPause = false;
        this._lastRecordTime = DateUtil.getServerTimeInMS;
    }

    pause(): void {
        this._isPause = true;
        this.addTime();
    }

    read(): number {
        if (this._leftMs >= this._unitMs) {
            let units: number = Math.floor(this._leftMs / this._unitMs);
            this._leftMs -= (units * this._unitMs);
            return units;
        } else {
            return 0;
        }
    }

    dispose(): void {
        this.pause();
        Laya.timer.clear(this, this.onTimer);
    }

    get isPause(): boolean {
        return this._isPause;
    }
}