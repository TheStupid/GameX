import Sprite = Laya.Sprite;

export default class CommonUtil {

    public static getValue<T>(value: T, defaultValue: T = null): T {
        if (value) {
            return value;
        }
        return defaultValue;
    }

    public static getTarget<T extends Sprite>(parent: Sprite, name: string): T {
        if (parent) {
            return parent.getChildByName(name) as T;
        }
        return null;
    }

    public static toPostData(params:Object):any
    {
        if(params){
            let data: string[] = [];
            for (let key in params) {
                data.push(key + "=" + params[key]);
            }
            return data.join("&");
        }
        return null;
    }

    public static getContentByTagName(xml: string, name: string): string[]
    {
        var reg = new RegExp("<" + name + ">(.*?)<\/" + name + ">", "g");
        var arr = xml.match(reg);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].replace("<" + name + ">", "").
            replace("</" + name + ">", "").
            replace("<![CDATA[", "").
            replace("]]>", "");
        }
        return arr;
    }
}