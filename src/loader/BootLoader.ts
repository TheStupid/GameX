import EventDispatcher from '../egret/events/EventDispatcher';
import IService from '../interfaces/IService';
import CustomLoader from '../loader/CustomLoader';
import Loading from '../common/Loading';
import DateUtil from '../util/DateUtil';
import DialogManager from '../common/dialog/DialogManager';
import LoadingSpriteType from '../loader/LoadingSpriteType';
import IInitService from '../interfaces/IInitService';
import InitServiceEvent from '../interfaces/InitServiceEvent';
import Event from '../egret/events/Event';
import ServiceContainer from '../interfaces/ServiceContainer';
import ConfigReader from '../loader/config/ConfigReader';
import CustomLoaderEvent from '../loader/CustomLoaderEvent';
import LoaderContainer from "../loader/LoaderContainer";
import Handler = Laya.Handler;

export default class BootLoader extends EventDispatcher {
    /** 引导成功 */
    public static readonly COMPLETE: string = "onBootLoaderComplete";
    /** 引导失败 */
    public static readonly ERROR: string = "onBootLoaderError";
    private _services: IService[] = [];
    private _totalService: number = 0;
    private _fileLoader: CustomLoader;

    public constructor() {
        super();
    }

    public init(): void {
        Loading.show();

        this.initDate();
        this.loadPreloadFiles();
    }

    public static reload(): void {
        LoaderContainer.instance.reload();
    }

    public closeLoadingSprite(): void {
        this._fileLoader.close();
        this._fileLoader = null;
    }

    private initDate(): void {
        DateUtil.init(Date.now());
    }


    private loadPreloadFiles(): void {
        let files: string[] = ConfigReader.instance.preloadFileList;
        Loading.load(files, Handler.create(this, this.loadAfterFiles));
    }

    private loadAfterFiles(): void {
        Loading.close();
        DialogManager.instance.clearAll();
        let files: string[] = ConfigReader.instance.afterLoadFileList;
        this._fileLoader = new CustomLoader();
        this._fileLoader.once(CustomLoaderEvent.onLoadCompleted, this.initServices, this);
        this._fileLoader.load(files, LoadingSpriteType.FULL_SCREEN, false, "正在下载相关文件……");
    }

    private initServices(evt: CustomLoaderEvent): void {
        this._services = [];
        let serviceNames: string[] = ConfigReader.instance.initService;
        // 配置的服务倒序进栈
        for (let index: number = serviceNames.length - 1; index >= 0; index--) {
            let serviceName = serviceNames[index];
            let service: IInitService = ServiceContainer.getService(serviceName) as IInitService;
            if (service == null) {
                throw new Error("init error: " + serviceName + " undefine.");
            }
            this._services.push(service);
        }

        this._fileLoader.loadingSprite.setProgress(0);
        this._fileLoader.loadingSprite.setLoadingText("正在初始化奥拉星……");
        this._totalService = this._services.length;
        if (this._totalService > 0) {
            this.initNextService();
        } else {
            this.onServiceInited(null);
        }
    }

    private initNextService(): void {
        let service: IInitService = this._services.pop() as IInitService;
        let index: number = this._totalService - this._services.length;
        let progress: number = Math.floor(index / this._totalService * 100);
        this._fileLoader.loadingSprite.setProgress(progress);
        service.addEventListener(InitServiceEvent.onInited, this.onServiceInited, this);
        service.init();
    }

    private onServiceInited(evt: InitServiceEvent): void {
        if (evt) {
            evt.target.removeEventListener(InitServiceEvent.onInited, this.onServiceInited, this);
        }
        if (this._services.length > 0) {
            this.initNextService();
            return;
        }
        Loading.close();
        this.dispatchEvent(new Event(BootLoader.COMPLETE));
    }
}