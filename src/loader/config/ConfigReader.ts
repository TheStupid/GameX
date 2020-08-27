import Loader from '../Loader';
import ConfigReadEvent from './ConfigReadEvent';
import EventDispatcher = Laya.EventDispatcher;
import Handler = Laya.Handler;

export default class ConfigReader extends EventDispatcher {
    public static readonly GAME_NAME: string = "奥拉星";
    public static readonly GAME_ID: number = 2;
    public static readonly PLATFORM_ID: number = 1;
    public static defaultZoneIndex: number = 0;
    private static readonly URL_CONFIG: string = "config.json";

    private static _instance: ConfigReader;

    private static readonly CONFIG: string[] =
        [
            ConfigReader.URL_CONFIG
        ];

    /** 是否已经加载过*/
    private _isLoaded: boolean = false;
    private _debug: boolean = true;
    private _configData: Object;

    public constructor() {
        super();
    }

    public static get instance(): ConfigReader {
        if (ConfigReader._instance == null) {
            ConfigReader._instance = new ConfigReader();
        }
        return ConfigReader._instance;
    }

    public get debug(): boolean {
        return this._debug;
    }

    // public get configData(): Object {
    //     return this._configData;
    // }

    public get preloadFileList():string[]{
        return this._configData["preloadFile"];
    }

    public get afterLoadFileList():string[]{
        return this._configData["afterLoadFile"];
    }

    public get initService():string[]{
        return this._configData["service"];
    }

    public loadConfig(): void {
        if (this._isLoaded) {
            this.event(ConfigReadEvent.onConfigLoadSuccess);
            return;
        }
        Loader.load(ConfigReader.CONFIG, Handler.create(this, this.onCompleted));
    }

    /**
     * 是否开发环境
     */
    public get isLocal(): boolean {
        var reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+):(\d+)$/;
        return window.location.protocol == "file:" || window.location.host == "www.pj2009h5.com" || reg.test(window.location.host);
    }

    private onCompleted(): void {
        this.parseConfigData();
        this._isLoaded = true;
        this.event(ConfigReadEvent.onConfigLoadSuccess);
    }

    private parseConfigData(): void {
        let data = Loader.getRes(ConfigReader.URL_CONFIG);
        Loader.clearRes(ConfigReader.URL_CONFIG);
        this._configData = data;
    }
}