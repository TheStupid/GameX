import Loader from "../../loader/Loader";

export default class URLAnalyzer {

    private static readonly PATTERN: RegExp = /^.+\.(json|atlas|png|jpg|jpeg|gif)$/i;

    public static convertToStandard(value: URLDef, isClass: boolean, wrapper: ((str: string) => string) = null): URLDefStd {
        let url: string = ((typeof value) == "string" ? value : value["url"]);
        let type: string = ((typeof value) == "string" ? null : value["type"]);
        if (isClass) {
            if (!url.match(URLAnalyzer.PATTERN)) {
                if (type == null) {
                    url = url.replace(/\./g, '/') + ".json";
                } else if (type == Loader.JSON) {
                    url = url.replace(/\./g, '/') + ".json";
                } else if (type == Loader.IMAGE) {
                    url = url.replace(/\./g, '/') + ".png";
                } else if (type == Loader.ATLAS) {
                    url = url.replace(/\./g, '/') + ".atlas";
                } else {
                    throw new Error("Convert error, url (as class): " + url + ", type: " + type);
                }
            }
        } else {
            if (!url.match(URLAnalyzer.PATTERN)) {
                url = url + ".atlas";
            }
        }
        if (type == null) {
            var suffix: string = url.substring(url.lastIndexOf(".")).toLocaleLowerCase();
            if (suffix == ".json") {
                type = Loader.JSON;
            } else if (suffix == ".atlas") {
                type = Loader.ATLAS;
            } else if (suffix == ".png" || suffix == ".jpg" || suffix == ".jpeg" || suffix == ".gif") {
                type = Loader.IMAGE;
            } else {
                throw new Error("Invalid url: " + url);
            }
        }
        if (wrapper != null) {
            url = wrapper(url);
        }
        return { "url": url, "type": type };
    }

    public static convertToStandardMulti(value: URLDef | URLDef[], wrapper: ((str: string) => string) = null, onceSet: object = null): URLDefStd[] {
        if (value == null) {
            return [];
        }
        var valueT: URLDef[] = value instanceof Array ? value : [value];
        var onceSetT: object = onceSet == null ? {} : onceSet;
        var results: URLDefStd[] = [];
        for (const ele of valueT) {
            let eleFinal: URLDefStd = URLAnalyzer.convertToStandard(ele, false, wrapper);
            if (onceSetT[eleFinal.url] != null) {
                continue;
            }
            results.push(eleFinal);
            onceSetT[eleFinal.url] = eleFinal;
        }
        return results;
    }

}

/**
 * type of string or { url: string, type?: string }
 */
export type URLDef = string | { url: string, type?: string };

/**
 * type of string or { url: string, type?: string }
 */
export type CLSDef = URLDef;

/**
 * { url: string, type: string }
 */
export interface URLDefStd { url: string, type: string }