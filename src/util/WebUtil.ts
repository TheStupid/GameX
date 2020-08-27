import StringUtil from './StringUtil';
import Browser = laya.utils.Browser;

export default class WebUtil {

    /**
     * 获取url参数
     */
    public static getQuery(): any {
        let search = window.location.search;
        if (!StringUtil.isNullOrEmpty(search)) {
            let arr = search.split("?")[1].split("&");
            let result = {};
            for (let str of arr) {
                let tmp = str.split("=");
                let key = tmp[0];
                let value = tmp[1];
                result[key] = value;
            }
            return result;
        }
        return null;
    }

    public static setCookie(name, value, expiresMs = 0, domain = ".100bt.com") {
        var str = name + "=" + encodeURIComponent(value);
        if (expiresMs != 0) {
            var date = new Date();
            date.setTime(date.getTime() + expiresMs);
            str += ";expires=" + date.toUTCString();
        }
        str += ';path=/;domain=' + domain;
        document.cookie = str;
    }

    public static getCookie(name): string {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return decodeURIComponent(arr[2]);
        }
        return null;
    }

    public static delCookie(name, domain = ".100bt.com") {
        WebUtil.setCookie(name, "", -1, domain);
    }

    /**
     * 手机震动
     * @param time 震动时间或[震动时间,停止时间,震动时间,停止时间...]，单位：毫秒
     */
    public static vibrate(time: number | number[]): void {
        if (navigator.vibrate) {//支持震动
            navigator.vibrate(time);
        }
    }

    /**
     * 复制内容到剪贴板
     * @param content 被复制的内容
     * @param succCall 复制成功回调
     * @param failCall 复制失败回调
     */
    public static setClipboard(content:string, succCall:Function = null, failCall:Function = null):void {
        let txt = Browser.createElement("textarea");
        Browser.container.appendChild(txt);
        txt.value = content;
        txt.select();
        let result = Browser.document.execCommand("copy");
        Browser.container.removeChild(txt);
        if(result){
            if(succCall)succCall();
        }else{
            if(failCall)failCall();
        }
    }

    /**
     * 访问来源
     */
    public static getSource():string
    {
        let query = WebUtil.getQuery();
        if (query && query.hasOwnProperty("source")) {
            return query["source"];
        }
        return "aola";
    }

    /**
     * 是否在App
     */
    public static get onApp():boolean
    {
        // if(Browser.onIOS){//iOS暂不显示下载按钮
            return true;
        // }
        return ["android", "ios"].indexOf(WebUtil.getSource()) != -1;
    }
}