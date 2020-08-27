import Loader from './Loader';
import ConfigReader from './config/ConfigReader';
import ConfigReadEvent from './config/ConfigReadEvent';
import LayerManager from './layer/LayerManager';
import CommonRes from "../config/CommonRes";
import Main from '../Main';
import Play from "./Play";
import Event = Laya.Event;
import Sprite = laya.display.Sprite;

export default class LoaderContainer extends Sprite {
    private static readonly BaseRes: string[] =
        [
            CommonRes.URL_IMG_BLACK,
            CommonRes.URL_COMMON_ATLAS
        ];

    public static instance: LoaderContainer;
    private _taskList: Array<Function> = [this.loadConfig, this.loadBaseRes];
    private _count = 0;

    public constructor() {
        super();
        LoaderContainer.instance = this;
        this._count = this._taskList.length;
        this.once(Event.ADDED, this, this.onAddToStage);
    }

    private onAddToStage() {
        LayerManager.init(this);
        this.runTasks();
    }

    private runTasks(): void {
        for (let task of this._taskList) {
            task.apply(this, null);
        }
    }

    private loadBaseRes(): void {
        Loader.load(LoaderContainer.BaseRes, Laya.Handler.create(this, this.onLoadedRes));
    }

    private loadConfig(): void {
        ConfigReader.instance.once(ConfigReadEvent.onConfigLoadSuccess, this, this.onConfigLoadSuccess);
        ConfigReader.instance.loadConfig();
    }

    private onConfigLoadSuccess(): void {
        this.tryShowLoginPanel();
    }

    private onLoadedRes(): void {
        this.tryShowLoginPanel();
    }

    private tryShowLoginPanel(): void {
        this._count--;
        if (this._count == 0) {
            new Play().start();
            Main.fadeOutLogo();
        }
    }

    public reload(): void {
        window.location.reload(true);
    }
}