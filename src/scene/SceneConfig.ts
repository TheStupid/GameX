import StringUtil from '../util/StringUtil';
import MainSquare from './ext/MainSquare';

export default class SceneConfig {

    private static _configs: Object = {};

    public static readonly Square = new SceneConfig("mainsquare", "奥拉广场", MainSquare, "scene/MainSquare.json",["scene/mainsquare.atlas"]);

    private _sceneName: string;
    private _description: string;
    private _classRef: any;
    private _dataUrl: string;
    private _resUrls: any[];

    private constructor(sceneName: string, description: string, classRef: any, dataUrl: string, resUrls: any[] = [], defaultBackground: boolean = true) {
        this._sceneName = sceneName;
        this._description = description;
        this._classRef = classRef;
        this._dataUrl = dataUrl;
        this._resUrls = resUrls;
        if (defaultBackground) {
            this._resUrls.push(StringUtil.format("scene/%s/background.jpg", sceneName));
        }
        SceneConfig._configs[sceneName] = this;
    }

    public static getConfig(sceneName: string): SceneConfig {
        return SceneConfig._configs[sceneName];
    }

    /**场景名标识 */
    public get sceneName(): string {
        return this._sceneName;
    }

    /**场景描述 */
    public get description(): string {
        return this._description;
    }

    /**场景实现类 */
    public get classRef(): any {
        return this._classRef;
    }

    /**场景数据地址 */
    public get dataUrl(): string {
        return this._dataUrl;
    }

    /**场景资源地址 */
    public get resUrls(): any[] {
        return this._resUrls;
    }
}