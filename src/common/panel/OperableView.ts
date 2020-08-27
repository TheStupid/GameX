import ClickHelper from "../helper/ClickHelper";
import SetResPacker from "../packer/SetResPacker";
import EventBinder from "../../util/common/EventBinder";
import IEventDispatcher from "../../egret/events/IEventDispatcher";
import Panel_Helper from "./Panel_Helper";
import Sprite = Laya.Sprite;
import Node = Laya.Node;

export default class OperableView {
    private _clickHelper: ClickHelper;
    private _setResPacker: SetResPacker;
    private _binder: EventBinder;
    private _tempArr: any[] = [];
    private _enabledThrowError: boolean;
    private _enabledSkipSelection: boolean;
    protected _view: Sprite;

    /**
     * 构造函数
     * @param urlOrRes 资源路径或资源实例
     * @param cls 面板导出类(scene路径)
     */
    constructor(view: Sprite = null, enabledThrowError: boolean = false,
                enabledSkipSelection: boolean = true) {
        this._enabledThrowError = enabledThrowError;
        this._enabledSkipSelection = enabledSkipSelection;
        this.registerView(view);
    }

    registerView(view: Sprite): void {
        this._view = view;
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
    public regClickFunc(pattern: any, callback: Function, withTarget: boolean = false, argArray: any[] = null, thisArg: any = null): OperableView {
        if (this._view) {
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
    public setText(params: any, text: any): OperableView {
        return this.trySetRes("setText", arguments);
    }

    /**
     * 设置显示对象是否显示
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param visible
     * @return
     */
    public setVisible(params: any, visible: boolean = false): OperableView {
        return this.trySetRes("setVisible", arguments);
    }

    /**
     * 设置MovieClip跳帧
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param frame string|number 帧数或标签
     * @return
     */
    public setFrame(params: any, frame: any): OperableView {
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
    public setArtNum(params: any, value: number, isHide: boolean = false, isAlignCenterWhenHide: boolean = false): OperableView {
        return this.trySetRes("setArtNum", arguments);
    }

    /**
     * 设置尺寸（如果只想修改width或height，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param width 宽
     * @param height 高
     * @return
     */
    public setSize(params: any, width: number, height: number): OperableView {
        return this.trySetRes("setSize", arguments);
    }

    /**
     * 设置坐标（如果只想修改x或y，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param x
     * @param y
     * @return
     */
    public setPos(params: any, x: number, y: number): OperableView {
        return this.trySetRes("setPos", arguments);
    }

    /**
     * 设置缩放比例（如果只想修改scaleX或scaleY，另外一个把原值传入）
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param scaleX
     * @param scaleY
     * @return
     */
    public setScale(params: any, scaleX: number, scaleY: number): OperableView {
        return this.trySetRes("setScale", arguments);
    }

    /**
     * 设置鼠标状态
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param mouseEnabled 默认false
     * @param mouseThrough 默认false
     * @return
     */
    public setMouseState(params: any, mouseEnabled: boolean = false, mouseThrough: boolean = false): OperableView {
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
    public setEnabled(params: any, value: any, disabledTips: string = null, isGray: boolean = true, isNotify: boolean = true): OperableView {
        return this.trySetRes("setEnabled", arguments);
    }

    /**
     * 设置旋转角度
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value
     * @return
     */
    public setRotation(params: any, value: number): OperableView {
        return this.trySetRes("setRotation", arguments);
    }

    /**
     * 设置透明度
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value 0~1
     * @return
     */
    public setAlpha(params: any, value: number): OperableView {
        return this.trySetRes("setAlpha", arguments);
    }

    /**
     * 设置多个属性
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param props 如：{"x":0, "width"960}
     * @return
     */
    public setProperties(params: any, props: any): OperableView {
        return this.trySetRes("setProperties", arguments);
    }

    /**
     * 设置Tips
     * @param params DisplayObject|String|[String|DisplayObject, String...]
     * @param tips string tips内容(null移除tips)
     * @param isNotify boolean 是否使用飘字提示
     */
    public setTips(params: any, tips: string = null, isNotify: boolean = true): OperableView {
        return this.trySetRes("setTips", arguments);
    }

    /**
     * 设置进度条(H5)
     * @param params DisplayObject|String|[String|DisplayObject, String...]
     * @param value 比例(0~1)，小于0或大于1会修正
     */
    public setProgressBar(params: any, value: number): OperableView {
        return this.trySetRes("setProgressBar", arguments);
    }

    /**
     * @param params DisplayObject|string|[string|DisplayObject, string...]
     * @param value 可以是 function(view:&#42;):void，也可以是 Object 对象，<br>
     *                如果是 Object 对象，必须要有属性 func，<nobr>类型是 function(view:&#42;, value:any):void</nobr>
     */
    public setAnything(params: any, value: any, argArray: any[] = null): OperableView {
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
    public setTheChild(params: any, childOrInfo: any): OperableView {
        return this.trySetRes("setTheChild", arguments);
    }

    dispose(): void {
        this._clickHelper.dispose();
        this._binder.unBindAll();
        this._clickHelper = null;
        this._binder = null;
    }

    /**
     * 初始化组件
     */
    protected initComponents(): void {
        this._view.mouseThrough = true;
        this._clickHelper = new ClickHelper(this._view);
        this._binder = new EventBinder();

        this._setResPacker = new SetResPacker(this._view);
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
        this._view.once(Laya.Event.REMOVED, this, this.onRemovedFromStage);
    }

    /**
     * 添加点击回调
     */
    protected addClickFuncs(): void {
    }

    /**
     * 移除事件监听
     */
    protected removeListeners(): void {
        this._view.off(Laya.Event.REMOVED, this, this.onRemovedFromStage);
    }

    /**
     * 初始化面板
     */
    protected init(): void {
        this.initComponents();
        this.setComponents();
        this.addListeners();
        this.addClickFuncs();
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

    protected intelligentlyGetIndex(target: Node, ignoreViewStackItem: boolean = true): number {
        return Panel_Helper.intelligentlyGetIndex(target, ignoreViewStackItem);
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
    protected series(target: any, ...tasks): OperableView {
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
    protected parallel(target: any, ...tasks): OperableView {
        for (let i: number = 0; i < tasks.length / 2; i++) {
            (tasks[i * 2] as Function).apply(this, [target].concat(tasks[i * 2 + 1]));
        }
        return this;
    }

    /**
     * 绑定监听器，关闭面板可自动除移
     */
    protected bind(target: IEventDispatcher | Laya.EventDispatcher, type: string, listener: Function, caller: any = null): void {
        this._binder.bind(target, type, listener, caller || this);
    }

    private addArgumentsToTempArr(key: string, argArray: IArguments): void {
        this._tempArr.push([key, argArray]);
    }

    private trySetRes(key: string, argArray: IArguments): OperableView {
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
}