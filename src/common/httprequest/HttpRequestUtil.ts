import HttpRequest = laya.net.HttpRequest;
import Loading from "../Loading";
import CommonUtil from "../../util/CommonUtil";

export default class HttpRequestUtil {
    public static post(url: string, params: object, caller: any, onPostComplete: Function, onPostIOError: Function, responseType: string = "text", requestTips?: string): void {
        Loading.show(requestTips);
        let request = new HttpRequest();

        let requestEnd = function () {
            Loading.close();
            request.off(Laya.Event.COMPLETE, caller, onPostComplete);
            request.off(Laya.Event.ERROR, caller, onPostIOError);
        };

        let onSuc = function () {
            HttpRequestUtil.callFunc(caller, requestEnd);
            HttpRequestUtil.callFunc(caller, onPostComplete, request.data);
        };

        let onError = function () {
            HttpRequestUtil.callFunc(caller, requestEnd);
            HttpRequestUtil.callFunc(caller, onPostIOError);
        };

        request.once(Laya.Event.COMPLETE, caller, onSuc);
        request.once(Laya.Event.ERROR, caller, onError);

        request.http.withCredentials = true;
        request.send(url, CommonUtil.toPostData(params), "post", "text", ["Content-Type", "application/x-www-form-urlencoded"]);
    }

    private static callFunc(thisArg: any, func: Function, args?: any): void {
        if (func != null) {
            func.apply(thisArg, [args]);
        }
    }
}