import LayerManager from '../loader/layer/LayerManager';
import IAbstractSceneHelper from './helper/abstractscene/IAbstractSceneHelper';
import SceneCommandStep from './SceneCommandStep';
import SceneCommand from './command/SceneCommand';
import CommandEvent from '../util/command/CommandEvent';
import AbstractSceneHelper from './helper/abstractscene/AbstractSceneHelper';
import SceneManager from './SceneManager';
import SceneOpenCommand from './command/loadscene/scenerender/SceneOpenCommand';
import TaskSceneInitedCommand from './command/loadscene/scenerender/TaskSceneInitedCommand';
import DisplayUtil from '../util/DisplayUtil';
import Sprite = Laya.Sprite;
import Scene = Laya.Scene;
import Point = Laya.Point;
import Rectangle = Laya.Rectangle;
import Panel = Laya.Panel;
import CommonRes from "../config/CommonRes";
import Box = laya.ui.Box;

export default abstract class AbstractScene extends Scene {

    // /** 栅格化地图信息 */
    // private _mapArray: number[][];

    /** 背景层 */
    private _background: Sprite = new Sprite();

    /** 容器层 */
    private _container: Sprite = new Sprite();

    /** 前景层 */
    private _foreground: Sprite = new Sprite();

    /** 最高层 */
    private _topground: Sprite = new Sprite();

    /** 障碍层 */
    private _obstruction: Sprite = new Sprite();

    private _scrollPanel: Panel = new Panel();
    private _scrollSprite: Sprite = new Sprite();

    // /** 可行走区域 */
    // private _walkAreas: Sprite[];
    // /** 不可行走区域 */
    // private _notWalkAreas: Sprite[];

    // /** 地图移动的处理中心 */
    // private _focusedObject: Sprite;

    /** 场景配置信息 */
    private _configHelper: IAbstractSceneHelper;

    /** 滚屏策略信息 */
        // private scrollStrategy: IScrollStrategy;

    private _commandsMap: Object = {};

    /**
     * 是否需要做离开场景验证
     */
    private _needValidateLeave: boolean = true;

    public constructor() {
        super();
    }

    public createView(view: any): void {
        super.createView(view);

        this._configHelper = this.getAbstractSceneHelper();
        // 背景层
        this._background = this.getBackground();
        // 容器层
        this._container = this.getContainer();
        // 前景层
        this._foreground = this.getForeground();
        //最高层
        this._topground = this.getTopground();
        this._topground.mouseThrough = true;

        // this._scrollSprite = new Laya.Sprite();
        this._scrollSprite.size(this.width, this.height);
        
        this._scrollSprite.addChild(this._background);
        this._scrollSprite.addChild(this._container);
        this._scrollSprite.addChild(this._foreground);
        
        this._scrollPanel.vScrollBarSkin = "";
        this._scrollPanel.addChild(this._scrollSprite);
        this._scrollPanel.once(Laya.Event.ADDED, this, this.onAddedToStage);
        Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
        this.onStageResize();
    }

    public getGridSize(): number {
        return this._configHelper.getGridSize();
    }

    public getSceneWidth(): number {
        return this._configHelper.getSceneWidth();
    }

    public getSceneHeight(): number {
        return this._configHelper.getSceneHeight();
    }

    /**
     * 背景层
     */
    public get backGround(): Sprite {
        return this._background;
    }

    public switchBackground(background: Sprite): void {
        LayerManager.getBaseScene().removeChild(this.backGround);
        this._background = background;
        var index: number = LayerManager.getBaseScene().getChildIndex(this.container);
        LayerManager.getBaseScene().addChildAt(this.backGround, index);
    }

    /**
     * 容器层
     */
    public get container(): Sprite {
        return this._container;
    }

    /**
     * 前景层
     */
    public get foreGround(): Sprite {
        return this._foreground;
    }

    /**
     * 最高层
     * */
    public get topGround(): Sprite {
        return this._topground;
    }

    /**
     * 不可行走区域
     */
    public get obStruction(): Sprite {
        return this._obstruction;
    }

    public get scrollPanel(): Panel {
        return this._scrollPanel;
    }

    /**
     * 接受自定义命令
     * obj.player:Player  发送命令的用户
     */
    public onCustomCommand(obj: Object): void {
    }

    /**
     * 响应用户进入房间
     */
    public handleJoinRoom(): void {
        // 初始化
        this.initRoom();
        this.onJoinRoom();
    }

    /**
     * 响应房间初始化完毕
     */
    public handleInited(): void {
        this.onInitedRoom();
    }

    /**
     * 响应用户离开房间
     */
    public handleDispose(): void {
        // 调用virtual method onLeaveRoom()
        this.onLeaveRoom();
        // 释放资源
        this.disposeRoom();
        Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
    }

    /**
     * 获得栅格化后的地图
     */
    // public getMapArray(): number[][] {
    //     return this._mapArray;
    // }

    /**
     * 设置栅格地图，1为不能行走,0为可走
     * 以场景的obstruction为底，额外设置notWalkArea数组中元件为不可走区域，额外设置walkArea数组中元件为可走区域
     * 区域重叠时，可走区域优先
     * 每设置一次，数组累加，清空时需要调removeWalkAres;
     */
    // public setMapArray(notWalkArea: egret.DisplayObject[] = null, walkArea: egret.DisplayObject[] = null): void {
    //     if (notWalkArea != null) {
    //         this._notWalkAreas = this._notWalkAreas.concat(notWalkArea);
    //     }
    //     if (walkArea != null) {
    //         this._walkAreas = this._walkAreas.concat(walkArea);
    //     }

    //     var w: number = (this._configHelper.getSceneWidth() / this.getGridSize()) ^ 0; // ^0 取整
    //     var h: number = (this._configHelper.getSceneHeight() / this.getGridSize()) ^ 0; // ^0 取整

    //     var gridSize: number = this._configHelper.getGridSize();
    //     var halfGridSize: number = this._configHelper.getGridSize() * 0.5;

    //     var nwaLen: number = this._notWalkAreas.length;
    //     var waLen: number = this._walkAreas.length;

    //     console.log(this.obStruction);


    //     var img: eui.Image = this.obStruction.getChildAt(0) as eui.Image;

    //     img.texture = RES.getRes("square_res.obstruction");
    //     var texture = img.texture;

    //     this._mapArray = new Array<Array<number>>(w);
    //     for (var i: number = 0; i < w; i++) {
    //         this._mapArray[i] = new Array<number>(h);
    //         for (var j: number = 0; j < h; j++) {
    //             var xx: number = i * gridSize + halfGridSize;
    //             var yy: number = j * gridSize + halfGridSize;

    //             var canWalk: boolean = false;
    //             var k: number;
    //             for (k = 0; k < waLen; k++) {
    //                 var dobj: egret.DisplayObject = this._walkAreas[k];
    //                 if (dobj.hitTestPoint(xx, yy, true)) {
    //                     canWalk = true;
    //                     break;
    //                 }
    //             }
    //             if (canWalk) {
    //                 this._mapArray[i][j] = 0;
    //                 continue;
    //             }

    //             canWalk = true;
    //             for (k = 0; k < nwaLen; k++) {
    //                 dobj = this._notWalkAreas[k];
    //                 if (dobj.hitTestPoint(xx, yy, true)) {
    //                     canWalk = false;
    //                     break;
    //                 }
    //             }
    //             if (!canWalk) {
    //                 this._mapArray[i][j] = 1;
    //                 continue;
    //             }

    //             console.log(img.texture.getPixels(xx, yy, 1, 1));
    //             console.log("nnnnn");
    //             if (img.texture.getPixels(xx, yy)[0] != 0) {
    //                 this._mapArray[i][j] = 1;
    //             } else {
    //                 this._mapArray[i][j] = 0;
    //             }
    //         }
    //     }

    //     PathFinder.instance.setMap(this._mapArray, this._configHelper.getGridSize());
    // }

    /**
     * 重置可行走区域和不可行走区域
     */
    // public removeWalkAres(): void {
    //     this._walkAreas = new Array<egret.DisplayObject>();
    //     this._notWalkAreas = new Array<egret.DisplayObject>();
    // }

    /**
     * 设置地图移动的中心点
     *
     * @param	obj	地图移动的中心点
     */
    // public setFocusedObject(obj: egret.DisplayObject): void {
    //     this.scrollStrategy.setFocusedObject(obj);
    // }

    /**
     * 目标点是可是当前用户可到达区域性，true表示可到达
     * @param stageX
     * @param stateY
     * @return
     */
    public arridable(stageX: number, stateY: number): boolean {
        return true;
    }

    /**
     * 获得舞台上的一个点，相对场景的左上角位置
     *
     * @param	point	相对Stage的绝对坐标
     *
     * @return	相对场景的相对坐标
     */
    public localPointToScene(point: Point): Point {
        var sRectX: number = 0;
        var sRectY: number = 0;
        if (this.scrollRect != null) {
            sRectX = this.scrollRect.x;
            sRectY = this.scrollRect.y;
        }
        /**加上sRectX是为了滚屏场景的坐标正确*/
        /**减去this.container.x再乘以this.container.scaleX是为了还原翻转过的容器里的坐标*/
        var x: number = (point.x + sRectX - this.container.x) * this.container.scaleX;
        var y: number = (point.y + sRectY - this.container.y) * this.container.scaleY;
        return new Point(x, y);
    }

    /**
     * 获得场景上的一个点，相对舞台左上角位置
     *
     * @param	point	相对场景的坐标
     *
     * @return	相对stage的坐标
     */
    public scenePointToStage(point: Point): Point {
        var sRectX: number = 0;
        var sRectY: number = 0;
        if (this.scrollRect != null) {
            sRectX = this.scrollRect.x;
            sRectY = this.scrollRect.y;
        }
        /**这里运算更复杂了，是上一个方法的反运算，不解释*/
        var x: number = (point.x / this.container.scaleX) + this.container.x - sRectX;
        var y: number = (point.y / this.container.scaleY) + this.container.y - sRectY;
        return new Point(x, y);
    }

    public get scrollRect(): Rectangle {
        return this._container.scrollRect;
    }

    public set scrollRect(rect: Rectangle) {
        if (this._background != null) {
            this._background.scrollRect = rect;
        }
        if (this._container != null) {
            this._container.scrollRect = rect;
        }
        if (this._foreground != null) {
            this._foreground.scrollRect = rect;
        }
    }

    /**
     * 增加场景处理命令
     * @param command:ISceneCommand
     * @param step
     */
    public addCommand(command: any, step: number = SceneCommandStep.PreRender): void {
        var cmdContainer: SceneCommand = this._commandsMap[step] as SceneCommand;
        if (cmdContainer == null) {
            cmdContainer = new SceneCommand();
            this._commandsMap[step] = cmdContainer;
        }
        cmdContainer.addCommand(command);
    }

    /**
     * 执行命令
     * @param step
     * @param callback:Function(success:boolean):void
     * @param thisObject
     *
     */
    public executeCommands(step: number, content: Object, callback: Function, thisObject: any = null): void {
        var cmdContainer: SceneCommand = this._commandsMap[step] as SceneCommand;
        //trace("executeCommands step:" + step + ", cmd:" + cmdContainer);
        if (cmdContainer == null) {
            callback.apply(thisObject, [true]);
            return;
        }

        cmdContainer.addEventListener(CommandEvent.SUCCEED
            , function (evt: CommandEvent): void {
                callback.apply(thisObject, [true]);
            }, this);
        cmdContainer.addEventListener(CommandEvent.FAILED
            , function (evt: CommandEvent): void {
                callback.apply(thisObject, [false]);
            }, this);
        cmdContainer.execute(content);
    }

    /**
     * 获取或设置离开场景时是否需要验证
     * @param value
     * @return
     */
    public set needValidateLeave(value: boolean) {
        this._needValidateLeave = value;
    }

    /**
     * 获取或设置离开场景时是否需要验证
     * @return
     *
     */
    public get needValidateLeave(): boolean {
        return this._needValidateLeave;
    }

    /**
     * 获得场景的配置信息
     */
    protected getAbstractSceneHelper(): IAbstractSceneHelper {
        return AbstractSceneHelper.getInstance();
    }

    /**
     * 获得的默认初始坐标名
     * virtual method
     **/
    protected abstract getDefaultLocationName(): string;

    /**
     * 获得场景默认坐标
     * virtual method
     */
    public abstract getDefaultLocation(): Point;

    /**
     * 获得背景层
     * virtual method
     **/
    protected abstract getBackground(): Sprite;

    /**
     * 获得前景层
     * virtual method
     */
    protected abstract getForeground(): Sprite;

    /**
     * 获得容器层
     * virtual method
     */
    protected abstract getContainer(): Sprite;

    /**
     * 获得最高层
     * */
    protected abstract getTopground(): Sprite;

    /**
     * 获得障碍层
     * virtual method
     */
    protected abstract getObstruction(): Sprite;

    /**
     * 进入房间
     * virtual method
     */
    protected abstract onJoinRoom(): void;

    /**
     * 房间初始化完毕(npc、任务等一系列东西加载完毕后调用)
     */
    protected onInitedRoom(): void {

    }

    public executeSceneCommand(): void {
        var sceneCommand: SceneCommand = new SceneCommand();
        sceneCommand.addCommand(SceneOpenCommand);
        sceneCommand.addCommand(TaskSceneInitedCommand);
        sceneCommand.execute({ "SceneInfo": SceneManager.getInstance().loadedSceneInfo });
    }

    /**
     * 离开房间
     * virtual method
     */
    protected abstract onLeaveRoom(): void;

    /**
     * 获得地图移动的中心点
     */
    protected getFocusedObject(): Sprite {
        return null;
    }

    /**
     * 初始化房间
     */
    protected initRoom(): void {
        // 初始化可行走区域
        // this.removeWalkAres();
        // this.setMapArray();
    }

    /**
     * 释放房间
     */
    protected disposeRoom(): void {
        // this._mapArray = null;
        this._commandsMap = null;

        // if (this.scrollStrategy != null) {
        //     this.scrollStrategy.dispose();
        // }
    }

    //~ private methods ---------------------------------------------------

    /**
     * On Added To Stage
     */
    private onAddedToStage(): void {
    }

    private onStageResize(): void {
        if(this.scrollPanel && this.scrollPanel.hScrollBar){
            this.scrollPanel.hScrollBar.stopScroll();
        }

        DisplayUtil.stretch(this._scrollPanel);
        DisplayUtil.stretch(this._topground);
    }
}