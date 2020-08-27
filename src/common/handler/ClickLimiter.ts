import DateUtil from "../../util/DateUtil";
import StringUtil from "../../util/StringUtil";
import NotifyQueue from "../notification/NotifyQueue";

export default class ClickLimiter {
    private _limitMs: number;
    private _last: number;

    constructor(limitMS: number) {
        this._limitMs = limitMS;
    }

    valid(notice?: string): boolean {
        let result:boolean = true;
        if (this._last == null) {
            this._last = DateUtil.getServerTimeInMS;
        }else{
            let now: number = DateUtil.getServerTimeInMS;
            if (now - this._last < this._limitMs) {
                if (!StringUtil.isNullOrEmpty(notice)) {
                    NotifyQueue.add(notice);
                }
                result = false;
            }
            this._last = now;
        }
        return result;
    }
}