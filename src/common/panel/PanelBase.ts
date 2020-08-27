import ClickHelper from "../helper/ClickHelper";
import SetResPacker from "../packer/SetResPacker";
import EventBinder from "../../util/common/EventBinder";
import DialogManager from "../dialog/DialogManager";
import IEventDispatcher from "../../egret/events/IEventDispatcher";
import Loader from "../../loader/Loader";
import {AlignType} from "../AlignType";
import LoadingSpriteType from "../../loader/LoadingSpriteType";
import Loading from "../Loading";
import CustomLoader from "../../loader/CustomLoader";
import CustomLoaderEvent from "../../loader/CustomLoaderEvent";
import {PanelEffect} from "../dialog/PanelEffect";
import Domain from "../../loader/Domain";
import StringUtil from "../../util/StringUtil";
import CommonRes from "../../config/CommonRes";
import DisplayUtil from "../../util/DisplayUtil";
import GameConfig from "../../GameConfig";
import IShowPanel from "../../interfaces/panel/IShowPanel";
import Panel_Helper from "./Panel_Helper";
import Sprite = Laya.Sprite;
import Handler = Laya.Handler;
import View = Laya.View;
import ViewStack = Laya.ViewStack;
import Box = Laya.Box;
import Node = Laya.Node;

/**
 * 面板基类
 */
export default class PanelBase extends Sprite implements IShowPanel {
    protected static readonly OPT_SET_MATERIAL_TIPS: number = 0x1;
    protected static readonly OPT_SET_CHALLENGE_INTERFACE: number = 0x2;

    private readonly _url: any[];
    private readonly _cls: string;
    private _clickHelper: ClickHelper;
    private _setResPacker: SetResPacker;
    private _binder: EventBinder;
    private _tempArr: any[] = [];
    private _enabledThrowError: boolean;
    private _enabledSkipSelection: boolean;
    private _alignType: AlignType;
    private _clickBackgroundRemove: boolean;
    protected _blackSprite: Sprite;
    private _showEffect: boolean;
    private _loadingType: number;
    private _fileLoader: CustomLoader;
    private _then: Function;
    protected res: Sprite;
    protected domain: Domain;
    protected autoClearRes: boolean = true;

    /**
     * 构造函数
     * @param urlOrRes 资源路径或资源实例
     * @param cls 面板导出类(scene路径)
     */
    constructor(urlOrRes: string | any[] | Sprite, cls: string = "", enabledThrowError: boolean = false,
                enabledSkipSelection: boolean = true) {
        super();
        this._enabledThrowError = enabledThrowError;
        this._enabledSkipSelection = enabledSkipSelection;
        if (urlOrRes instanceof Sprite) {
            this.res = this.changeToViewStack(urlOrRes);
        } else {
            this._url = [];
            if (urlOrRes != null && urlOrRes.length > 0) {
                if (typeof urlOrRes === "string") {
                    this._url.push(urlOrRes.indexOf(".") != -1 ? urlOrRes : urlOrRes + ".atlas");
                } else {
                    this._url = urlOrRes.slice();
                    let ele: any = this._url[0];
                    if (typeof ele === "string" && ele.indexOf(".") == -1) {
                        this._url[0] = ele + ".atlas";
                    }
                }
            }
            this._cls = cls.indexOf(".") != -1 ? cls : cls + ".json";
            this._url.push(this._cls);
        }
    }

    public show(domain: Domain = null, alignType: AlignType = AlignType.MIDDLE_CENTER, clickBackgroundRemove: boolean = false, isBlackBackground: boolean = false,
                showEffect: boolean = true, loadingType: number = LoadingSpriteType.NONE): void {
        this.domain = domain || new Domain();
        this._alignType = alignType;
        this._clickBackgroundRemove = clickBackgroundRemove;
        if (isBlackBackground) {
            this._blackSprite = Sprite.fromImage(CommonRes.URL_IMG_BLACK);
        }
        this._showEffect = showEffect;
        this._loadingType = loadingType;
        if (this.res) {
            this.onGetRes(this.res);
        } else {
            if (domain) {
                domain.add(this._url);
            }
            if (loadingType == LoadingSpriteType.NONE) {
                Loading.load(this._url, Handler.create(this, this.onLoaded));
            } else {
                this._fileLoader = new CustomLoader();
                this._fileLoader.once(CustomLoaderEvent.onLoadCompleted, this.onLoaded, this);
                this._fileLoader.load(this._url, loadingType, true, "正在加载相关文件……");
            }
        }
    }

    public close(): void {
        DialogManager.instance.removeDialog(this);
    }

    /**
     * 注册点击面板触发的函数（资源加载前后都可调用）
     * @param pattern RegExp|string
     * @param callback
     * @param withTarget 是否返回触发对象
     * @param argArray
     * @param thisArg
     * @return
     */
    public regClickFunc(pattern: any, callback: Function, withTarget: boolean = false, argArray: any[] = null, thisArg: any = null): PanelBase {
        if (this.res) {
            if (typeof pattern === "string") {
                this._clickHelper.regClickFunc(pattern, callback, thisArg || this, argArray, withTarget);
            } else {
                this._clickHelper.regRegexFunc(pattern, callback, thisArg || this, argArray, withTarget);
            }
        } else {
            this.addArgumentsToTempArr("regClickFunc", arguments);
        }
        return this;
    }

    /**
     * 设置文本内容
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param text string|number|number
     * @return
     */
    public setText(params: any, text: any): PanelBase {
        return this.trySetRes("setText", arguments);
    }

    /**
     * 设置显示对象是否显示
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param visible
     * @return
     */
    public setVisible(params: any, visible: boolean = false): PanelBase {
        return this.trySetRes("setVisible", arguments);
    }

    /**
     * 设置MovieClip跳帧
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param frame string|number 帧数或标签
     * @return
     */
    public setFrame(params: any, frame: any): PanelBase {
        return this.trySetRes("setFrame", arguments);
    }

    /**
     * 使用NumberUtil设置美术数字元件
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value 数值
     * @param isHide 是否隐藏多余的数位
     * @param isAlignCenterWhenHide 当隐藏时是否自动居中 默认不居中
     * @return
     */
    public setArtNum(params: any, value: number, isHide: boolean = false, isAlignCenterWhenHide: boolean = false): PanelBase {
        return this.trySetRes("setArtNum", arguments);
    }

    /**
     * 设置尺寸（如果只想修改width或height，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param width 宽
     * @param height 高
     * @return
     */
    public setSize(params: any, width: number, height: number): PanelBase {
        return this.trySetRes("setSize", arguments);
    }

    /**
     * 设置坐标（如果只想修改x或y，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param x
     * @param y
     * @return
     */
    public setPos(params: any, x: number, y: number): PanelBase {
        return this.trySetRes("setPos", arguments);
    }

    /**
     * 设置缩放比例（如果只想修改scaleX或scaleY，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param scaleX
     * @param scaleY
     * @return
     */
    public setScale(params: any, scaleX: number, scaleY: number): PanelBase {
        return this.trySetRes("setScale", arguments);
    }

    /**
     * 设置鼠标状态
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param mouseEnabled 默认false
     * @param mouseThrough 默认false
     * @return
     */
    public setMouseState(params: any, mouseEnabled: boolean = false, mouseThrough: boolean = false): PanelBase {
        return this.trySetRes("setMouseState", arguments);
    }

    /**
     * 设置按钮启用状态
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value boolean|Object
     * @param disabledTips string 非启用状态添加的tips
     * @param isGray boolean 非启用状态灰掉
     * @param isNotify 是否使用飘字提示
     * @return
     */
    public setEnabled(params: any, value: any, disabledTips: string = null, isGray: boolean = true, isNotify: boolean = true): PanelBase {
        return this.trySetRes("setEnabled", arguments);
    }

    /**
     * 设置旋转角度
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value
     * @return
     */
    public setRotation(params: any, value: number): PanelBase {
        return this.trySetRes("setRotation", arguments);
    }

    /**
     * 设置透明度
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value 0~1
     * @return
     */
    public setAlpha(params: any, value: number): PanelBase {
        return this.trySetRes("setAlpha", arguments);
    }

    /**
     * 设置多个属性
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param props 如：{"x":0, "width"960}
     * @return
     */
    public setProperties(params: any, props: any): PanelBase {
        return this.trySetRes("setProperties", arguments);
    }

    /**
     * 设置Tips
     * @param params DisplayObject|String|[String|DisplayObject, String...]
     * @param tips string tips内容(null移除tips)
     * @param isNotify boolean 是否使用飘字提示
     */
    public setTips(params: any, tips: string = null, isNotify: boolean = true): PanelBase {
        return this.trySetRes("setTips", arguments);
    }

    /**
     * 设置进度条(H5)
     * @param params DisplayObject|String|[String|DisplayObject, String...]
     * @param value 比例(0~1)，小于0或大于1会修正
     */
    public setProgressBar(params: any, value: number): PanelBase {
        return this.trySetRes("setProgressBar", arguments);
    }

    /**
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value 可以是 function(view:&#42;):void，也可以是 Object 对象，<br>
     *                如果是 Object 对象，必须要有属性 func，<nobr>类型是 function(view:&#42;, value:any):void</nobr>
     */
    public setAnything(params: any, value: any, argArray: any[] = null): PanelBase {
        return this.trySetRes("setAnything", arguments);
    }

    /**
     * 为容器设定子元件
     * @param params DisplayObject|string|[string|DisplayObjectContainer, string...]
     * @param childOrInfo DisplayObject 或一个 Object，传 null 会清容器，如果是 Object，则有如下属性：
     *    <div style="margin-left:48">
     *        <table>
     *            <tr>
     *                <th>字段</th>
     *                <th>类型</th>
     *             <th>说明</th>
     *            </tr>
     *            <tr>
     *                <td>child</td>
     *                <td>DisplayObject or function():DisplayObject</td>
     *             <td>要加的子元件或其获取函数</td>
     *            </tr>
     *            <tr>
     *            <td>key</td>
     *                <td>string</td>
     *            <td>用于标记，同样名字不会再加，推荐使用全大写</td>
     *            </tr>
     *        </table>
     *    </div>
     */
    public setTheChild(params: any, childOrInfo: any): PanelBase {
        return this.trySetRes("setTheChild", arguments);
    }

    protected onStageResize(): void {
        DisplayUtil.stretch(this);
        if (this._blackSprite) {
            DisplayUtil.stretch(this._blackSprite);
        }
        if (this._alignType == AlignType.NONE) {
            DisplayUtil.stretch(this.res);
            let scaleX: number = Laya.stage.width / GameConfig.width;
            let scaleY: number = Laya.stage.height / GameConfig.height;
            let imgMainBg: Sprite = this.res.getChildByName("imgBg") as Sprite;
            if (imgMainBg != null) {
                imgMainBg.scale(scaleX, scaleY);
            }
            for (let i: number = 0; i < this.res.numChildren; i++) {
                let imgOtherBg: Sprite = this.res.getChildByName("imgBg_" + i) as Sprite;
                if (imgOtherBg != null) {
                    imgOtherBg.scale(Laya.stage.width / imgOtherBg.width, Laya.stage.height / imgOtherBg.height);
                }
                let imgBgX: Sprite = this.res.getChildByName("imgBgX_" + i) as Sprite;
                if (imgBgX != null) {
                    imgBgX.scale(scaleX, 1);
                }
            }

            let content: Sprite = this.res.getChildByName("content") as Sprite;
            if (content != null) {
                let needScale: boolean = content.width > Laya.stage.width || content.height > Laya.stage.height;
                if (needScale) {
                    let minScale: number = Math.min(scaleX, scaleY);
                    content.scale(minScale, minScale);
                }
            }

            let lBox = this.getChild("lBox") as Box;
            let cBox = this.getChild("cBox") as Box;
            let rBox = this.getChild("rBox") as Box;
            let width = 0;
            let count = 1;
            if (lBox) {
                if (!isNaN(lBox.left)) {
                    if (isNaN(lBox.centerY)) {
                        lBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += lBox.width;
            }
            if (cBox) {
                if (!isNaN(cBox.centerX)) {
                    if (isNaN(cBox.centerY)) {
                        cBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += cBox.width;
            }
            if (rBox) {
                if (!isNaN(rBox.right)) {
                    if (isNaN(rBox.centerY)) {
                        rBox.centerY = 0;
                    }
                } else {
                    count++;
                }
                width += rBox.width;
            }
            let scale;
            if (width > Laya.stage.width) {
                scale = Laya.stage.width / width;
            } else {
                scale = GameConfig.height / Laya.stage.height;
            }
            let interval = (Laya.stage.width - width * scale) / count;
            if (lBox) lBox.scale(scale, scale);
            if (cBox) cBox.scale(scale, scale);
            if (rBox) rBox.scale(scale, scale);
            let x = interval;
            if (lBox) {
                if (isNaN(lBox.left)) {
                    lBox.x = x;
                    x += interval;
                }
                x += lBox.width * scale;
            }
            if (cBox) {
                if (isNaN(cBox.centerX)) {
                    cBox.x = x;
                    x += interval;
                }
                x += cBox.width * scale;
            }
            if (rBox && isNaN(rBox.right)) rBox.x = x;
        } else {
            let scale: number = this.getScale(this.res);
            this.res.scale(scale, scale);
            DisplayUtil.align(this.res, this._alignType);
        }
    }

    protected getScale(res: Sprite): number {
        let scale: number;
        if (this.res.width > Laya.stage.width) {
            scale = Laya.stage.width / this.res.width;
        } else if (Laya.stage.width < Laya.stage.height) {
            scale = Laya.stage.width / GameConfig.height;
        } else {
            scale = GameConfig.height / Laya.stage.height;
        }
        return scale;
    }

    public then(callback: Function): PanelBase {
        this._then = callback;
        return this;
    }

    protected dispose(): void {
        this._clickHelper.dispose();
        this._binder.unBindAll();
        this._clickHelper = null;
        this._binder = null;

        if (this.autoClearRes) {
            this.domain.clear();
            this.domain = null;
        }
    }

    /**
     * 初始化组件
     */
    protected initComponents(): void {
        this.mouseThrough = true;
        this._clickHelper = new ClickHelper(this.res);
        this._binder = new EventBinder();

        // let content: Sprite = this.res.getChildByName("content") as Sprite;
        // if (content) {
        //     this._setResPacker = new SetResPacker(content);
        // } else {
        //     this._setResPacker = new SetResPacker(this.res);
        // }
        this._setResPacker = new SetResPacker(this.res);
        this._setResPacker.enabledThrowError = this._enabledThrowError;
        this._setResPacker.enabledSkipSelection = this._enabledSkipSelection;
    }

    protected setComponents(options: number = Number.MIN_VALUE): void {
        for (let arr of this._tempArr) {
            (this[arr[0]] as Function).apply(this, arr[1]);
        }
        this._tempArr = null;
    }

    /**
     * 添加事件监听
     */
    protected addListeners(): void {
        this.res.on(Laya.Event.REMOVED, this, this.onRemovedFromStage);
        Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
    }

    /**
     * 添加点击回调
     */
    protected addClickFuncs(options: number = Number.MAX_VALUE): void {
        this.regClickFunc("btnClose", this.onClickClose);
    }

    /**
     * 移除事件监听
     */
    protected removeListeners(): void {
        this.res.off(Laya.Event.REMOVED, this, this.onRemovedFromStage);
        Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
    }

    /**
     * 初始化面板之前
     */
    protected beforeInitPanel(): void {
        this.initPanel();
    }

    /**
     * 显示面板之前
     */
    protected beforeAddToStage(): void {
        this.addToStage();
    }

    /**
     * 初始化面板
     */
    protected initPanel(): void {
        this.initComponents();
        this.setComponents();
        this.onStageResize();
        this.addListeners();
        this.addClickFuncs();
        this.beforeAddToStage();
    }

    /**
     * 显示面板
     */
    protected addToStage(): void {
        DialogManager.instance.addDialog(this, this._alignType, this._showEffect ? PanelEffect.POP : PanelEffect.NONE,
            true, 0, 0, this._clickBackgroundRemove, Handler.create(this, this.onEffectEnd));
        this.afterAddToStage();
        if (this._then) {
            this._then();
            this._then = null;
        }
    }

    protected onEffectEnd(): void {
    }

    /**
     * 显示面板之后
     */
    protected afterAddToStage(): void {
    }

    /**
     * 点击关闭按钮
     */
    protected onClickClose(): void {
        this.close();
    }

    /**
     * 获取子元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @return
     */
    protected getChild(params: any): any {
        return this._setResPacker.getChild(params);
    }

    /**
     * 获取父元件
     * @param params Sprite|string|[string|Sprite, string...]
     * @return
     */
    protected getParent(params: any): Sprite {
        return this._setResPacker.getParent(params);
    }

    /**
     * 设置资源失败是否抛出错误提示
     */
    protected set enabledThrowError(value: boolean) {
        this._setResPacker.enabledThrowError = this._enabledThrowError = value;
    }

    /**
     * 设置资源失败是否抛出错误提示
     */
    protected get enabledThrowError(): boolean {
        return this._enabledThrowError;
    }

    /**
     * 是否跳过ViewStack当前Selection
     */
    protected set enabledSkipSelection(value: boolean) {
        this._setResPacker.enabledSkipSelection = this._enabledSkipSelection = value;
    }

    /**
     * 是否跳过ViewStack当前Selection
     */
    protected get enabledSkipSelection(): boolean {
        return this._enabledSkipSelection;
    }

    /**
     * 执行串行任务
     * @param target
     * @param tasks callback1,argArray1,callback2,argArray2……
     * @return
     */
    protected series(target: any, ...tasks): PanelBase {
        let index: number = 0;
        let next: Function = function (): void {
            if (index < tasks.length) {
                (tasks[index] as Function).apply(null, [next, target].concat(tasks[index * 2 + 1]));
                index += 2;
            }
        };
        return this;
    }

    /**
     * 执行并行任务
     * @param target
     * @param tasks callback1,argArray1,callback2,argArray2……
     * @return
     */
    protected parallel(target: any, ...tasks): PanelBase {
        for (let i: number = 0; i < tasks.length / 2; i++) {
            (tasks[i * 2] as Function).apply(this, [target].concat(tasks[i * 2 + 1]));
        }
        return this;
    }

    /**
     * 绑定监听器，关闭面板可自动除移
     */
    protected bind(target: IEventDispatcher | Laya.EventDispatcher, type: string, listener: Function, caller: any = null, layaArgs: Array<any> = null): void {
        this._binder.bind(target, type, listener, caller || this, layaArgs);
    }

    protected intelligentlyGetIndex(target: Node, ignoreViewStackItem: boolean = true): number {
        return Panel_Helper.intelligentlyGetIndex(target, ignoreViewStackItem);
    }

    // /**
    //  * 左边框
    //  */
    // protected get lBox(): Box {
    //     return this.getChild("lBox");
    // }
    //
    // /**
    //  * 中间框
    //  */
    // protected get cBox(): Box {
    //     return this.getChild("cBox");
    // }
    //
    // /**
    //  * 右边框
    //  */
    // protected get rBox(): Box {
    //     return this.getChild("rBox");
    // }

    private onLoaded(evt: CustomLoaderEvent = null): void {
        if (this._loadingType != LoadingSpriteType.NONE) {
            this._fileLoader = null;
        }
        let res = new View();
        res.createView(Loader.getRes(this._cls));
        this.onGetRes(this.changeToViewStack(res));
    }

    private addArgumentsToTempArr(key: string, argArray: IArguments): void {
        this._tempArr.push([key, argArray]);
    }

    private onGetRes(res: Sprite): void {
        if (this._blackSprite) {
            this.addChild(this._blackSprite);
        }
        this.res = res;
        this.addChild(res);
        this.beforeInitPanel();
    }

    private changeToViewStack(res: Sprite): Sprite {
        if (res.numChildren == 1) {
            let vs: Sprite = res.getChildAt(0) as Sprite;
            if (vs instanceof ViewStack && StringUtil.isNullOrEmpty(vs.name)) {
                res = vs.removeSelf() as ViewStack;
            }
        }
        return res;
    }

    private trySetRes(key: string, argArray: IArguments): PanelBase {
        if (this._setResPacker) {
            (this._setResPacker[key] as Function).apply(this._setResPacker, argArray);
        } else {
            this.addArgumentsToTempArr(key, argArray);
        }
        return this;
    }

    private onRemovedFromStage(): void {
        this.removeListeners();
        this.dispose();
    }

    private match(options: number, option: number): boolean {
        return options == Number.MAX_VALUE || (options & option) != 0;
    }

    showPanel(data?: any): void {
        this.show(null, AlignType.MIDDLE_CENTER, true);
    }
}