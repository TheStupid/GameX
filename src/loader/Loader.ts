import StringUtil from '../util/StringUtil';
import Handler = Laya.Handler;

export default class Loader {

    private static DEFAULT_VERSION: string = "1000";
    private static version: string;

    /** 文本类型，加载完成后返回文本。*/
    public static readonly TEXT: string = Laya.Loader.TEXT;
    /** JSON 类型，加载完成后返回json数据。*/
    public static readonly JSON: string = Laya.Loader.JSON;
    /** XML 类型，加载完成后返回domXML。*/
    public static readonly XML: string = Laya.Loader.XML;
    /** 二进制类型，加载完成后返回arraybuffer二进制数据。*/
    public static readonly BUFFER: string = Laya.Loader.BUFFER;
    /** 纹理类型，加载完成后返回Texture。*/
    public static readonly IMAGE: string = Laya.Loader.IMAGE;
    /** 声音类型，加载完成后返回sound。*/
    public static readonly SOUND: string = Laya.Loader.SOUND;
    /** 图集类型，加载完成后返回图集json信息(并创建图集内小图Texture)。*/
    public static readonly ATLAS: string = Laya.Loader.ATLAS;
    /** TTF字体类型，加载完成后返回null。*/
    public static readonly TTF: string = Laya.Loader.TTF;

    public static initVersion(version: string, versionMap: Object): void {
        Loader.version = version;
        versionMap["difference.json"] = version;//difference.json使用大版本
        Laya.URL.version = versionMap;
        Laya.URL.customFormat = (url: string): string => {
            if (StringUtil.isNullOrEmpty(Loader.version) || window.location.protocol === "file:") {
                return url;
            }
            let index = url.lastIndexOf(".");
            let type = url.substring(index + 1);
            let version: string;
            if ((Laya.URL.version as Object).hasOwnProperty(url)) {
                version = Laya.URL.version[url];
            } else {
                version = Loader.DEFAULT_VERSION;//默认版本号
            }
            if (type == "ttf") {
                return url + "?v=" + version;
            }
            let name = url.substring(0, index);
            return name + "~" + version + "." + type;
        };
        // Laya.WorkerLoader.workerPath = "libs/worker.js";
        // Laya.WorkerLoader.enable = true;
        Laya.loader.retryNum = 5;
    }

    /**url为any[]时，type不传时自动读取数组中每个string的后缀判断类型，传type时则全用type类型。*/
    public static load(url: string | any[], complete?: Handler, progress?: Handler, type?: string, priority?: number, cache?: boolean, group?: string, ignoreCache?: boolean): void {
        if (typeof url === "string") {
            if (StringUtil.isNullOrEmpty(type)) {
                type = Loader.getType(url);
            }
        } else if (StringUtil.isNullOrEmpty(type)) {
            for (let i = 0; i < url.length; i++) {
                let ele = url[i];
                if (typeof ele === "string") {
                    url[i] = {"url": ele, "type": Loader.getType(ele)};
                }
            }
        }
        else {
            for (let i = 0; i < url.length; i++) {
                let ele = url[i];
                if (typeof ele === "string") {
                    url[i] = {"url": ele, "type": type};
                }
            }
        }
        Laya.loader.load(url, complete, progress, type, priority, cache, group, ignoreCache);
    }

    public static cancelLoad(url: string | string[]): void {
        if (typeof url === "string") {
            Laya.loader.cancelLoadByUrl(url);
        } else {
            Laya.loader.cancelLoadByUrls(url);
        }
    }

    public static getRes(url: string): any {
        return Laya.loader.getRes(url);
    }

    public static clearRes(url: string | (Object | string)[]): void {
        if (typeof url === "string") {
            Laya.loader.clearRes(url);
        } else {
            for (let obj of url) {
                if (typeof obj === "string") {
                    Laya.loader.clearRes(obj);
                } else {
                    Laya.loader.clearRes(obj["url"]);
                }
            }
        }
    }

    public static getType(url: string): string {
        let ext: string = url.split(".")[1];
        switch (ext) {
            case "json":
                return Loader.JSON;
            case "png":
            case "jpg":
                return Loader.IMAGE;
            case "atlas":
            case "fmv":
                return Loader.ATLAS;
            case "xml":
                return Loader.XML;
            case "txt":
                return Loader.TEXT;
            case "mp3":
                return Loader.SOUND;
            case "ttf":
                return Loader.TTF;
            case "zip":
                return Loader.BUFFER;
        }
        return null;
    }
}