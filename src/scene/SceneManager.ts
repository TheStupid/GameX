import EventDispatcher from '../egret/events/EventDispatcher';
import SceneInfo from './SceneInfo';
import ICommand from '../util/command/ICommand';
import NewDialog from '../common/dialog/NewDialog';
import SceneManagerEvent from './SceneManagerEvent';
import CommandEvent from '../util/command/CommandEvent';
import SceneConfig from './SceneConfig';
import FBSceneInfo from './FBSceneInfo';
import LoadFBCommand from './command/loadfb/LoadFBCommand';

export default class SceneManager extends EventDispatcher {

    private static _instance: SceneManager;

    /** 当前已加载的场景信息 */
    private _currentSceneInfo: SceneInfo;
    /** 当前执行的命令 */
    private _loadingCommand: ICommand;

    private _isSuspend: boolean = false;

    public constructor() {
        super();
    }

    public static getInstance(): SceneManager {
        if (SceneManager._instance == null) {
            SceneManager._instance = new SceneManager();
        }
        return SceneManager._instance;
    }

    /**
     * 是否正在加载
     */
    public get isLoading(): boolean {
        return this._loadingCommand != null ? true : false;
    }

    public get loadedSceneInfo(): SceneInfo {
        return this._currentSceneInfo;
    }

    public set loadedSceneInfo(info: SceneInfo) {
        this._currentSceneInfo = info;
        this._isSuspend = false;
    }

    public get isSuspend(): boolean {
        return this._isSuspend;
    }

    public loadScene(sceneName: string, locationName: string = "default"
        , forceLoad: boolean = false, isEt: boolean = false): void {
        if (SceneConfig.getConfig(sceneName) == null) {
            NewDialog.showFailMessage("没有该场景哦！");
            return;
        }
        this.loadTempScene(sceneName, sceneName);//
    }

    public loadDefaultScene(): void {
        this.loadScene("mainsquare");
    }

    public getCurSceneName():string{
        return this.loadedSceneInfo.sceneName;
    }

    /**
     * 进入临时
     * @param sceneName 场景名
     * @param tempName 临时场景标识
     * @param sceneDesc 临时场景描述，默认获取Config.xml内配置的场景(sceneName)的描述
     * @param key 队伍信息，默认为单人副本，即：当前用户名
     * @param locationName 初始化位置
     * */
    public loadTempScene(sceneName: string, tempName: string, sceneDesc: string = ""
        , teamKey: string = "", locationName = "default"): void {
        if (sceneDesc == null || sceneDesc == "") {
            sceneDesc = SceneConfig.getConfig(sceneName).description;
        }

        let info: FBSceneInfo = new FBSceneInfo();
        info.sceneName = sceneName;
        info.serverRoom = sceneName + "_" + tempName + "_" + teamKey + "_temp";
        info.locationName = locationName;
        info.sceneDesc = sceneDesc;
        info.isFB = true;

        info.fbName = tempName;
        info.teamKey = teamKey;

        this.executeCommand(LoadFBCommand, {"SceneInfo": info});
    }

    public executeCommand(commandClassRef: any, content: Object,
                          succCallback: Function = null,
                          failCallback: Function = null) {
        if (this._loadingCommand != null) {
            return;
        }
        content["cancel"] = false;
        this.dispatchEvent(new SceneManagerEvent(SceneManagerEvent.ON_LOADING_SCENE, content));
        if (content["cancel"] == true) {
            // Loading.close();
            return;
        }

        let command: ICommand = new commandClassRef();
        this._loadingCommand = command;

        let context: SceneManager = this;
        let succFunc = (evt: CommandEvent) => {
            this._loadingCommand.removeEventListener(CommandEvent.SUCCEED, succFunc, this);
            this._loadingCommand.removeEventListener(CommandEvent.FAILED, failFunc, this);

            this._loadingCommand = null;

            if (succCallback != null) {
                succCallback.apply(this, [evt.params]);
            }
            // Loading.close();
            this.dispatchEvent(new SceneManagerEvent(SceneManagerEvent.SCENE_CONSTRUCTED));
        };

        let failFunc = (evt: CommandEvent) => {
            this._loadingCommand.removeEventListener(CommandEvent.SUCCEED, succFunc, this);
            this._loadingCommand.removeEventListener(CommandEvent.FAILED, failFunc, this);

            this._loadingCommand = null;

            if (failCallback != null) {
                failCallback.apply(this, [evt.params]);
            }
            // Loading.close();
        };

        this._loadingCommand.addEventListener(CommandEvent.SUCCEED, succFunc, this);
        this._loadingCommand.addEventListener(CommandEvent.FAILED, failFunc, this);
        // Loading.show();
        command.execute(content);
    }
}