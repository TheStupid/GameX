import AbstractScene from './AbstractScene';
import Point = Laya.Point;
import Sprite = Laya.Sprite;

export default class SceneBase extends AbstractScene {

    /**场景配置路径 */
    private _url: string;

    /**场景额外资源路径 */
    private _extUrls: object[];

    //~ 是否需要调用initSceneObject
    protected _isNeedInitSceneObject: boolean = false;
    /** 玩家出生点范围 */
    private static readonly PLAYER_BORN_RANGE: number = 32;

    //~ fields ------------------------------------------------------------

    /** 默认出生点坐标 */
    private _defaultLocation: Point;

    /** 场景出生点 */
    private _initPoints: Object;

    /** 可点击物体管理器 */
    // private _clickObjManager: ClickableObjManager;

    /** 碰撞管理器 */
    // protected _hitManager:HitManager;

    /** 人物动作助手 */
    // private _actionHelper:ActionHelper;

	/**
	 * 房间是否已经初始化完成 
	 */
    private _hasInitRoom: Boolean = false;

    public constructor(pointX: number = 0, pointY: number = 0, width: number = 0, height: number = 0, points: number[][] = null) {
        super();

        if (points != null && points.length > 0) {
            var arr: number[] = points[Math.floor(points.length * Math.random())];
            pointX = arr[0];
            pointY = arr[1];
            width = arr.length > 2 ? arr[2] : 0;
            height = arr.length > 3 ? arr[3] : 0;
        }
        if (width > 0) {
            pointX += Math.round(height * Math.random());
        }
        if (height > 0) {
            pointY += Math.round(height * Math.random());
        }
        this._defaultLocation = new Point(pointX, pointY);
        this._initPoints = {};
    }

    public createView(view: any): void {
        super.createView(view);
        // 添加默认出生点
        this.addInitLocation(this.getDefaultLocationName(), this.getDefaultLocation());
    }

    // public getPlayerGenerator(): IPlayerGenerator {
    //     return new DefaultPlayerGenerator();
    // }

    // public get actionHelper(): ActionHelper {
    //     return this._actionHelper;
    // }

    //~ protected methods -------------------------------------------------

	/**
	 * 设置进入其他场景的入口
	 * @param	hitObj			碰撞物体
	 * @param	sceneName		场景名称
	 * @param	locationName	场景出生点
	 * @param	clickObject		点击物体
	 * @param	onHitBump:Function(sceneName, locationName)		碰撞到跳转点时的处理方法
	 **/
    // protected addEntrances(hitObject: egret.DisplayObject,
    //     sceneName: string,
    //     locationName: string = "default",
    //     clickObject: egret.DisplayObject = null, onHitBump: Function = null): void {

    //     var entranceHandler: IBumpHandler = new SceneEntranceHandler(sceneName, locationName, onHitBump);

    //     this._addEntranceHandler(entranceHandler, hitObject, clickObject);
    //     //为传送点添加默认的Tips
    //     var sceneDesc: String = ConfigReader.instance.getSceneDescription(sceneName);
    //     if (sceneDesc != null) {
    //     	if (clickObject != null) {
    //     		TipsManager.getInstance().addTips(clickObject as InteractiveObject, sceneDesc);
    //     	} else if (hitObject != null) {
    //     		TipsManager.getInstance().addTips(hitObject as InteractiveObject, sceneDesc);
    //     	}
    //     }
    // }

    // protected _addEntranceHandler(entranceHandler: IBumpHandler,
    // 	hitObject: DisplayObject,
    // 	clickObject: DisplayObject): void {

    // 	var button: Sprite;
    // 	if (clickObject != null) {
    // 		button = (clickObject as Sprite);
    // 	} else {
    // 		button = (hitObject as Sprite);
    // 	}
    // 	if (button) {
    // 		button.buttonMode = true;
    // 	}

    // 	addHitObjectWithBumpHandler(entranceHandler, hitObject, clickObject);
    // }

	/**
	 * 增加自定义碰撞处理器的入口
	 * @param bumpHandler 		碰撞处理器
	 * @param hitObject 		碰撞物体
	 * @param clickObject		点击物体
	 *
	 */
    // protected addHitObjectWithBumpHandler(bumpHandler: IBumpHandler
    // 	, hitObject: DisplayObject, clickObject: DisplayObject = null): void {
    // 	if (PlayerManager.getInstance().myPlayer == null) {
    // 		throw new Error("addEntrance()必须在构造完成后调用，onJoinRoom()中或之后调用");
    // 	}

    // 	var playerSprite: Sprite = PlayerManager.getInstance().myPlayer;
    // 	var bumper: IBumper = new BumpBumper("SE_" + hitObject.name, hitObject, playerSprite, bumpHandler, _clickObjManager);
    // 	this._hitManager.addBumper(bumper);

    // 	if (clickObject != null) {
    // 		hitObject.visible = false;
    // 		addWalkTarget(clickObject, hitObject);
    // 	} else {
    // 		hitObject.visible = true;
    // 		hitObject.alpha = 0;
    // 		addWalkTarget(hitObject, hitObject);
    // 	}
    // }

	/**
	 * 点击物体，并走向指定目标
	 * 点击clickObj物体，走向walkTarget物体的注册点
	 *
	 * @param clickObj		可被点击的物体
	 * @param walkTarget	行走目标物体
	 **/
    // protected addWalkTarget(clickObj: egret.DisplayObject, walkTarget: egret.DisplayObject = null): void {
    //     if (walkTarget == null) {
    //         walkTarget = clickObj;
    //     }
    //     this._clickObjManager.addClickableObj(clickObj, walkTarget);
    // }

	/**
	 * 设置玩家进入场景的可选择初始坐标
	 **/
    protected addInitLocation(name: string, point: Point): void {
        this._initPoints[name] = point;
    }

	/**
	 * 获得的默认初始坐标名
	 * virtual method
	 **/
    protected getDefaultLocationName(): string {
        return "default";
    }

	/**
	 * 获得场景默认坐标
	 * virtual method
	 */
    public getDefaultLocation(): Point {
        return this._defaultLocation;
    }

    /**
     * 获得背景层
     **/
    protected getBackground(): Sprite {
        return (super.getChildByName("background") as Sprite);
    }

    /**
     * 获得前景层
     * virtual method
     */
    protected getForeground(): Sprite {
        return (super.getChildByName("foreground") as Sprite);
    }

    /**
     * 获得容器层
     * virtual method
     */
    protected getContainer(): Sprite {
        return (super.getChildByName("overlap") as Sprite);
    }

    /**
     * 获得障碍层
     * virtual method
     */
    protected getObstruction(): Sprite {
        return (super.getChildByName("obstruction") as Sprite);
    }

    /**
     * 获得最高层
     * */
    protected getTopground(): Sprite {
        return (super.getChildByName("topground") as Sprite);
    }

	/**
	 * 进入房间
	 * virtual method
	 */
    protected onJoinRoom(): void {
    }

	/**
	 * 离开房间
	 * virtual method
	 */
    protected onLeaveRoom(): void {
    }

	/**
	 * 当用户进入房间，并初始化完成
	 */
    // protected onUserEnterRoom(e: PlayerManagerEvent): void {

    //     if (!this._hasInitRoom) {
    //     	this.container.addChild(e.player);
    //     } else {
    //     	this._depthManager.addChild(e.player);
    //     }
    // }

	/**
	 * 用户离开房间
	 */
    // protected onUserLeaveRoom(e: PlayerManagerEvent): void {
    //     DisplayUtil.remove(e.player);
    // }

	/**
	 * 初始化房间
	 */
    protected initRoom(): void {
        super.initRoom();

        this.initPlayerManager();

        // this._hitManager = new HitManager();

        // this._clickObjManager = new ClickableObjManager();
        // this._clickObjManager.setControlItem(PlayerManager.getInstance().myPlayer as IMovable);

        // this._actionHelper = new ActionHelper();

        // this.showEffectes();

        // this._hasInitRoom = true;

        // this._initSceneObject = new InitSceneObject(container);
        // if (_isNeedInitSceneObject) {
        // 	_initSceneObject.initSceneObject();
        // }
    }

	/**
	 * 释放房间
	 */
    protected disposeRoom(): void {
        // if (this._hitManager != null) {
        // 	this._hitManager.dispose();
        // 	this._hitManager = null;
        // }

        // if (this._clickObjManager != null) {
        // 	this._clickObjManager.dispose();
        // 	this._clickObjManager = null;
        // }

        // if (this._actionHelper != null) {
        // 	this._actionHelper.dispose();
        // 	this._actionHelper = null;
        // }

        // PlayerManager.getInstance().removeEventListener(PlayerManagerEvent.ENTER_ROOM, onUserEnterRoom);
        // PlayerManager.getInstance().removeEventListener(PlayerManagerEvent.LEAVE_ROOM, onUserLeaveRoom);
        // PlayerManager.getInstance().clearPlayers();

        // this.clearEffectes();
        // this._initSceneObject.disposeSceneObject();

        // super.disposeRoom();
    }

    protected showEffectes(): void {
    }

    protected clearEffectes(): void {
    }

    //~ private methods ---------------------------------------------------

    private initPlayerManager(): void {
        //测试代码-avatar 
        /*#begin
        var avatar:Avatar = Avatar.createAvatar();
        avatar.containerShadow = this.subContainerBottom;
        avatar.containerSkin = this.subContainerMiddle;
        avatar.containerText = this.subContainerTop;
        avatar.pos = new Laya.Point(200, 200);
        avatar.renderSelf = true;
        avatar.action = "wn";
        avatar.dir = "rd";
        avatar.addClothesID("1");
        #end*/
        
        // PlayerManager.getInstance().addEventListener(PlayerManagerEvent.ENTER_ROOM, onUserEnterRoom, false, EventListenerPriority.FIVE, true);
        // PlayerManager.getInstance().addEventListener(PlayerManagerEvent.LEAVE_ROOM, onUserLeaveRoom, false, 0, true);

        // var locationName: String = SceneManager.getInstance().loadedSceneInfo.locationName;

        // var point: Point = this._initPoints[locationName];
        // if (point == null) {
        // 	point = this._initPoints["default"];
        // }

        // point.x += Math.random() * PLAYER_BORN_RANGE - (PLAYER_BORN_RANGE >> 1);
        // point.y += Math.random() * PLAYER_BORN_RANGE - (PLAYER_BORN_RANGE >> 1);

        // point = PathFinder.instance.searchnearpoint(point.x, point.y)
        // PlayerManager.getInstance().initPlayers(this, point);
    }

    // public arridable(stageX: number, stateY: number): boolean {
    //     return PathFinder.instance.validatePointIsInUnMovableArea(new egret.Point(stageX, stateY));
    // }
}