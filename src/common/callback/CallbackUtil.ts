import Handler = Laya.Handler;


export default class CallbackUtil {
    public static apply(callback: Handler | Function, args?: any, thisArg?: any): void {
        if (callback == null) {
            return;
        }

        if (callback instanceof Handler) {
            callback.runWith(args);
        } else {
            if (args != null && !Array.isArray(args)) {
                callback.apply(thisArg, [args]);
            } else {
                callback.apply(thisArg, args);
            }
        }
    }
}
